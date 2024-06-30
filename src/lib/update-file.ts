import { UpdateFileOpts, type Item, type Processes } from "./types";
import { writeFile } from "fs/promises";
import { getFile } from "./get-file";
import { isNested, isObject } from "./tools";

const isIndex = (key: string) => {
    return Number.isNaN(+key);
};

export const updateFile = async (opts: UpdateFileOpts, processes: Processes) => {
    const { fileKey, filePath, indent } = opts;
    const data = await getFile(filePath);
    const { queue } = processes[fileKey];
    const queueLength = queue.length;
    const processQueue = queue.splice(0, queueLength);

    for (const queueItem of processQueue) {
        const segments = queueItem.key.split(".");
        let segmentData = data;
        if (queueItem.type === "create") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    segmentData[segment] = "";
                } else {
                    segmentData[segment] ||= isIndex(segment) ? [] : {};
                    segmentData = segmentData[segment];
                }
            }
        } else if (queueItem.type === "update") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    segmentData[segment] = queueItem.value;
                } else {
                    segmentData[segment] ||= isIndex(segment) ? [] : {};
                    segmentData = segmentData[segment];
                }
            }
        } else if (queueItem.type === "delete") {
            const nestingList: { segment: string; item: Item }[] = [];
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    if (!(segment in segmentData)) break;

                    delete segmentData[segment];
                    for (let x = nestingList.length - 1; x >= 0; x--) {
                        const nestingItem = nestingList[x];

                        if (isNested(nestingItem.item, nestingItem.segment)) {
                            const nestedItem = nestingItem.item[nestingItem.segment];
                            if (isObject(nestedItem) && Object.keys(nestedItem).length === 0) {
                                delete nestingItem.item[nestingItem.segment];
                                continue;
                            }
                        }
                        break;
                    }
                } else if (segment in segmentData) {
                    nestingList.push({ item: segmentData, segment });
                    segmentData = segmentData[segment];
                }
            }
        }
    }
    await writeFile(filePath, JSON.stringify(data, null, indent), "utf-8");
    console.log(`Updated ${fileKey} data, changes count: ${queueLength}`);

    const nextChangesCount = queue.length;

    if (nextChangesCount) {
        processes[fileKey].target = updateFile(opts, processes);
    } else {
        processes[fileKey].target = null;
    }
};

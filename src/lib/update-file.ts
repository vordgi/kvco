import { type Item, type Processes } from "./types";
import { writeFile } from "fs/promises";
import { getFile } from "./get-file";
import { isNested, isObject } from "./tools";

export const updateFile = async (fileKey: string, filePath: string, processes: Processes) => {
    const { queue } = processes[fileKey];
    const queueLength = queue.length;
    const processQueue = queue.splice(0, queueLength);
    const data = await getFile(filePath);

    for await (const queueItem of processQueue) {
        const segments = queueItem.key.split(".");
        let segmentData = data;
        if (queueItem.type === "create") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    segmentData[segment] = "";
                } else {
                    segmentData[segment] ||= {};
                    segmentData = segmentData[segment];
                }
            }
        } else if (queueItem.type === "update") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    segmentData[segment] = queueItem.value;
                } else {
                    segmentData[segment] ||= {};
                    segmentData = segmentData[segment];
                }
            }
        } else if (queueItem.type === "delete") {
            const nestingList: { segment: string; item: Item }[] = [];
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
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
                } else {
                    nestingList.push({ item: segmentData, segment });
                    segmentData = segmentData[segment];
                }
            }
        }
    }
    writeFile(filePath, JSON.stringify(data, null, 4), "utf-8");
    console.log(`Updated ${fileKey} data, changes count: ${queueLength}`);

    const nextChangesCount = queue.length;

    if (nextChangesCount) {
        processes[fileKey].target = updateFile(fileKey, filePath, processes);
    } else {
        processes[fileKey].target = null;
    }
};

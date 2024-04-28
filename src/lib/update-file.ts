import { type Item, type Processes } from "./types";
import { writeFile } from "fs/promises";
import { getFile } from "./get-file";
import { isNested, isObject } from "./tools";

export const updateFile = async (locale: string, processes: Processes) => {
    const { queue } = processes[locale];
    const queueLength = queue.length;
    const processQueue = queue.splice(0, queueLength);
    const terms = await getFile(locale);

    for await (const queueItem of processQueue) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const segments = queueItem.term.split(".");
        let term = terms;
        if (queueItem.type === "create") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    term[segment] = "";
                } else {
                    term[segment] ||= {};
                    term = term[segment];
                }
            }
        } else if (queueItem.type === "update") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    term[segment] = queueItem.value;
                } else {
                    term[segment] ||= {};
                    term = term[segment];
                }
            }
        } else if (queueItem.type === "delete") {
            const nestingList: { segment: string; item: Item }[] = [];
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    delete term[segment];
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
                    nestingList.push({ item: term, segment });
                    term = term[segment];
                }
            }
        }
    }
    writeFile(`./terms/${locale}.json`, JSON.stringify(terms, null, 4), "utf-8");
    console.log(`Updated ${locale} terms, changes count: ${queueLength}`);

    const nextChangesCount = queue.length;

    if (nextChangesCount) {
        processes[locale].target = updateFile(locale, processes);
    } else {
        processes[locale].target = null;
    }
};

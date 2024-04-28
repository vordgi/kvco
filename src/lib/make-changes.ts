import { type Processes, type QueueItem } from "./types";
import { updateFile } from "./update-file";

export const makeChanges = (item: QueueItem, locale: string, processes: Processes) => {
    if (!processes[locale]) processes[locale] = { target: null, queue: [] };
    console.log(processes[locale].queue);
    processes[locale].queue.push(item);

    if (processes[locale].target) return;

    processes[locale].target = updateFile(locale, processes);
};

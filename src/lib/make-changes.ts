import { type Processes, type QueueItem } from "./types";
import { updateFile } from "./update-file";

export const makeChanges = (item: QueueItem, fileKey: string, filePath: string, processes: Processes) => {
    if (!processes[fileKey]) processes[fileKey] = { target: null, queue: [] };
    processes[fileKey].queue.push(item);

    if (processes[fileKey].target) return;

    processes[fileKey].target = updateFile(fileKey, filePath, processes);
};

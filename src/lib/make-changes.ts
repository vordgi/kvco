import { type UpdateFileOpts, type Processes, type QueueItem } from "./types";
import { updateFile } from "./update-file";

export const makeChanges = (item: QueueItem, opts: UpdateFileOpts, processes: Processes) => {
    const { fileKey } = opts;
    if (!processes[fileKey]) processes[fileKey] = { target: null, queue: [] };
    processes[fileKey].queue.push(item);

    if (processes[fileKey].target) return;

    processes[fileKey].target = updateFile(opts, processes);
};

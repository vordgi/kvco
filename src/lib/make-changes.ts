import { type UpdateFileOpts, type Processes, type QueueItem } from "./types";
import { updateFile } from "./update-file";

export const makeChanges = (item: QueueItem, opts: UpdateFileOpts, processes: Processes) => {
    const { filePath } = opts;
    if (!processes[filePath]) processes[filePath] = { target: null, queue: [] };
    processes[filePath].queue.push(item);

    if (processes[filePath].target) return;

    processes[filePath].target = updateFile(opts, processes);
};

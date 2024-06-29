import { Server, Socket } from "socket.io";
import { type Processes } from "../../lib/types";
import { makeChanges } from "../../lib/make-changes";
import { Configuration } from "../../lib/configuration";

const processes: Processes = {};

export const editorHandlers = (_io: Server, socket: Socket, config: Configuration) => {
    const edit = (data: { key: string; value: string; fileKey: string }) => {
        const key = data.key;
        const value = data.value;
        const fileKey = data.fileKey;
        const fileData = config.files.find((f) => f.key === fileKey);

        if (!fileData) return;

        console.log(`Update key "${key}"`);
        makeChanges(
            {
                key,
                type: "update",
                value: value || "",
            },
            fileKey,
            fileData.path,
            processes,
        );
    };

    const create = (data: { key: string; value: string; fileKey: string }) => {
        const key = data.key;
        console.log(`Create key "${key}"`);
        config.files.forEach((fileData) => {
            makeChanges(
                {
                    key,
                    type: "create",
                },
                fileData.key,
                fileData.path,
                processes,
            );
        });
    };

    const remove = (data: { key: string; value: string; fileKey: string }) => {
        const key = data.key;
        console.log(`Delete key "${key}"`);
        config.files.forEach((fileData) => {
            makeChanges(
                {
                    key,
                    type: "delete",
                },
                fileData.key,
                fileData.path,
                processes,
            );
        });
    };

    socket.on("editor:edit", edit);
    socket.on("editor:create", create);
    socket.on("editor:remove", remove);
};

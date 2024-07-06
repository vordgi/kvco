import { Server, Socket } from "socket.io";
import { type Processes } from "../../lib/types";
import { makeChanges } from "../../lib/make-changes";
import { Configuration } from "../../lib/configuration";

const processes: Processes = {};

export const editorHandlers = (_io: Server, socket: Socket, config: Configuration) => {
    const edit = (data: { key: string; value: string; fileKey: string; path: string }) => {
        const key = data.key;
        const value = data.value;
        const filePath = data.path;
        const fileData = config.files.find((f) => f.path === filePath);

        if (!fileData) return;

        console.log(`Update key "${key}"`);
        makeChanges(
            {
                key,
                type: "update",
                value: value || "",
            },
            {
                filePath: fileData.path,
                indent: config.indent,
            },
            processes,
        );
    };

    const create = (data: { key: string }) => {
        const key = data.key;
        console.log(`Create key "${key}"`);
        config.files.forEach((fileData) => {
            makeChanges(
                {
                    key,
                    type: "create",
                },
                {
                    filePath: fileData.path,
                    indent: config.indent,
                },
                processes,
            );
        });
    };

    const remove = (data: { key: string; staticPart: string }) => {
        const key = data.key;
        const staticPart = data.staticPart;
        console.log(`Delete key "${key}"`);
        config.files.forEach((fileData) => {
            if (fileData.staticPart === staticPart) {
                makeChanges(
                    {
                        key,
                        type: "delete",
                    },
                    {
                        filePath: fileData.path,
                        indent: config.indent,
                    },
                    processes,
                );
            }
        });
    };

    socket.on("editor:edit", edit);
    socket.on("editor:create", create);
    socket.on("editor:remove", remove);
};

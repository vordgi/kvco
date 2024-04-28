import { type IncomingMessage, type ServerResponse } from "http";
import { type Processes, type Config } from "../lib/types";
import { makeChanges } from "../lib/make-changes";
import { collectData } from "../lib/collect-data";

const processes: Processes = {};

const inioRoute = async (req: IncomingMessage & { url: URL }, res: ServerResponse, config: Config) => {
    const method = req.method?.toLowerCase();
    const { files } = config;

    try {
        const key = req.url.searchParams.get("key") || "";
        const value = req.url.searchParams.get("value") || "";
        const fileKey = req.url.searchParams.get("fileKey") || "";

        if (method === "get") {
            const data = await collectData(files);
            return res.end(JSON.stringify(data));
        }

        const fileData = files.find((f) => f.key === fileKey);
        if (!fileData) return res.end();

        if (method === "post") {
            console.log(`Create key "${key}"`);
            makeChanges(
                {
                    key,
                    type: "create",
                },
                fileKey,
                fileData.path,
                processes,
            );
            return res.end();
        }

        if (method === "delete") {
            console.log(`Delete key "${key}"`);
            makeChanges(
                {
                    key,
                    type: "delete",
                },
                fileKey,
                fileData.path,
                processes,
            );
            return res.end();
        }

        if (method === "put") {
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
            return res.end();
        }
        return res.end();
    } catch (e) {
        console.log(`error on ${method}`, e);
    }
};

export default inioRoute;

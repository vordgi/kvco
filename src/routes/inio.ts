import { type IncomingMessage, type ServerResponse } from "http";
import { type Processes, type Config } from "../lib/types";
import { makeChanges } from "../lib/make-changes";
import { collectData } from "../lib/collect-data";

const processes: Processes = {};

const inioRoute = async (req: IncomingMessage & { url: URL }, res: ServerResponse, config: Config) => {
    const method = req.method?.toLowerCase();
    const { files } = config;

    try {
        if (method === "get") {
            const search = req.url.searchParams.get("s");
            const page = req.url.searchParams.get("p");
            const countOnPage = req.url.searchParams.get("c");
            const data = await collectData(files);
            let resultData = data;
            if (search) {
                resultData = data.filter((item) => item.key.includes(search));
            }
            if (page && countOnPage) {
                resultData = resultData.slice((+page - 1) * +countOnPage, (+page - 1) * +countOnPage);
            }
            return res.end(JSON.stringify({ list: resultData, keys: files.map(({ key }) => key) }));
        }

        if (method === "post") {
            const key = req.url.searchParams.get("key") || "";
            console.log(`Create key "${key}"`);
            files.forEach((fileData) => {
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
            return res.end();
        }

        if (method === "delete") {
            const key = req.url.searchParams.get("key") || "";
            console.log(`Delete key "${key}"`);
            files.forEach((fileData) => {
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
            return res.end();
        }

        if (method === "put") {
            const key = req.url.searchParams.get("key") || "";
            const value = req.url.searchParams.get("value") || "";
            const fileKey = req.url.searchParams.get("fileKey") || "";
            const fileData = files.find((f) => f.key === fileKey);

            if (!fileData) return res.end();

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

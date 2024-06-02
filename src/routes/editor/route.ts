import { type ServerResponse } from "http";
import { type Processes, InioRequest } from "../../lib/types";
import { makeChanges } from "../../lib/make-changes";
import { collectData } from "../../lib/collect-data";

const processes: Processes = {};

export const GET = async (req: InioRequest, res: ServerResponse) => {
    const search = req.url.searchParams.get("s");
    const page = req.url.searchParams.get("p");
    const countOnPage = req.url.searchParams.get("c");
    const data = await collectData(req.config.files);
    let resultData = data;
    if (search) {
        resultData = data.filter((item) => item.key.includes(search));
    }
    if (page && countOnPage) {
        resultData = resultData.slice((+page - 1) * +countOnPage, (+page - 1) * +countOnPage);
    }
    return res.end(JSON.stringify({ list: resultData, keys: req.config.files.map(({ key }) => key) }));
};

export const POST = async (req: InioRequest, res: ServerResponse) => {
    const key = req.url.searchParams.get("key") || "";
    console.log(`Create key "${key}"`);
    req.config.files.forEach((fileData) => {
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
};

export const DELETE = async (req: InioRequest, res: ServerResponse) => {
    const key = req.url.searchParams.get("key") || "";
    console.log(`Delete key "${key}"`);
    req.config.files.forEach((fileData) => {
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
};

export const PUT = async (req: InioRequest, res: ServerResponse) => {
    const key = req.url.searchParams.get("key") || "";
    const value = req.url.searchParams.get("value") || "";
    const fileKey = req.url.searchParams.get("fileKey") || "";
    const fileData = req.config.files.find((f) => f.key === fileKey);

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
};

import { type IncomingMessage, type ServerResponse } from "http";
import { type Processes } from "../lib/types";
import { makeChanges } from "../lib/make-changes";
import { collectData } from "../lib/collect-data";

const processes: Processes = {};

const inioRoute = async (req: IncomingMessage & { url: URL }, res: ServerResponse) => {
    const method = req.method?.toLowerCase();

    try {
        const term = req.url.searchParams.get("term") || "";
        const value = req.url.searchParams.get("value") || "";
        const locale = req.url.searchParams.get("locale") || "";

        if (method === "get") {
            const terms = await collectData(["en", "de"]);
            return res.end(JSON.stringify(terms));
        }

        if (method === "post") {
            console.log(`Create term "${term}"`);
            makeChanges(
                {
                    term,
                    type: "create",
                },
                locale,
                processes,
            );
            return res.end();
        }

        if (method === "delete") {
            console.log(`Delete term "${term}"`);
            makeChanges(
                {
                    term,
                    type: "delete",
                },
                locale,
                processes,
            );
            return res.end();
        }

        if (method === "put") {
            console.log(`Update term "${term}"`);
            makeChanges(
                {
                    term,
                    type: "update",
                    value: value || "",
                },
                locale,
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

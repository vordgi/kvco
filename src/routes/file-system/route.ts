import { type ServerResponse } from "http";
import { type InioRequest } from "../../lib/types";
import { findSegmentItems } from "../../lib/find-segment-items";
import { Configuration } from "../../lib/configuration";
import path from "path";

export const GET = async (req: InioRequest, res: ServerResponse) => {
    const dir = req.url.searchParams.get("dir");
    if (typeof dir !== "string") {
        res.statusCode = 400;
        return res.end();
    }

    // Blocking the receipt of files outside the scope in which the utility is launched.
    if (!Configuration.validatePattern(dir)) {
        res.statusCode = 400;
        return res.end();
    }

    const files = await findSegmentItems(dir);
    if (files === null) {
        res.statusCode = 400;
        return res.end();
    }

    const segmentKeys = files.reduce<{ [key: string]: { name: string; isDir: boolean; path: string } }>((acc, cur) => {
        if (!acc[cur.name]) {
            acc[cur.name] = {
                name: cur.name,
                isDir: cur.isDir,
                path: path.posix.relative(process.cwd(), cur.path),
            };
        }
        return acc;
    }, {});
    return res.end(JSON.stringify(Object.values(segmentKeys)));
};

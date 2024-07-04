import { type ServerResponse } from "http";
import { type InioRequest } from "../../lib/types";
import { Configuration } from "../../lib/configuration";
import path from "path";

export const GET = async (req: InioRequest, res: ServerResponse) => {
    const pattern = req.url.searchParams.getAll("pattern");
    const ignore = req.url.searchParams.getAll("ignore");

    // Blocking the receipt of files outside the scope in which the utility is launched.
    if (
        pattern.some((pt) => !Configuration.validatePattern(pt)) ||
        ignore.some((pt) => !Configuration.validatePattern(pt))
    ) {
        res.statusCode = 400;
        return res.end();
    }

    const files = await Configuration.loadFiles(pattern, ignore);
    return res.end(
        JSON.stringify(
            files.map((file) => ({
                ...file,
                path: path.relative(process.cwd(), file.path).replaceAll(path.sep, "/"),
            })),
        ),
    );
};

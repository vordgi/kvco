import { type SegmentItem } from "./types";
import { glob } from "glob";
import path from "path";

export const findSegmentItems = async (
    pattern: string,
    otherPatterns: string[] = [],
    ignore: string | string[] = [],
): Promise<SegmentItem[]> => {
    if (pattern.match(/\*\*/)) {
        console.warn(`Invalid pattern rule "${pattern}"`);
        return [];
    }
    const ignoreArr = typeof ignore === "string" ? [ignore, ...otherPatterns] : [...otherPatterns, ...ignore];

    const segments = pattern.split("/");
    const globPath = [".", ...segments.map((segment) => (segment === "<key>" ? "*" : segment))].join("/");

    const files = await glob(globPath, {
        ignore: ignoreArr,
        posix: true,
        cwd: process.cwd(),
    });
    const keyIndex = segments.indexOf("<key>");

    const itemsData: { name: string; isDir: boolean; path: string; key?: string }[] = [];
    for await (const file of files) {
        const { name, ext } = path.parse(file);
        if (!ext || ext === ".json") {
            itemsData.push({
                name,
                isDir: !ext,
                path: path.join(process.cwd(), file).replaceAll(path.sep, "/"),
                key: keyIndex !== -1 ? file.split("/")[keyIndex] : name,
            });
        }
    }
    return itemsData;
};

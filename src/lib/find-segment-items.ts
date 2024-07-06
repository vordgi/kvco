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
    const globPath = [".", ...segments.map((segment) => segment.replace("<key>", "*"))].join("/");

    const files = await glob(globPath, {
        ignore: ignoreArr,
        posix: true,
        cwd: process.cwd(),
    });
    const keyIndex = segments.indexOf("<key>");

    const itemsData: SegmentItem[] = [];
    for await (const file of files) {
        const { name, ext } = path.parse(file);
        if (!ext || ext === ".json") {
            const fileSegments = file.split("/");
            itemsData.push({
                name,
                isDir: !ext,
                path: file,
                key: keyIndex !== -1 ? fileSegments[keyIndex] : name,
                staticPart: keyIndex === -1 ? file : fileSegments.filter((_, index) => index !== keyIndex).join("/"),
            });
        }
    }
    return itemsData;
};

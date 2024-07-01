import { type SegmentItem } from "./types";
import { glob } from "glob";
import path from "path";

export const findSegmentItems = async (dir: string): Promise<SegmentItem[] | null> => {
    if (dir.endsWith(".json") || dir.match("**")) {
        console.warn(`Invalid dir rule "${dir}"`);
        return null;
    }
    const segments = dir.split("/");
    const globPath = [".", ...segments.map((segment) => (segment === "<key>" ? "*" : segment)), "*"].join("/");
    const files = await glob(globPath, {
        posix: true,
        cwd: process.cwd(),
    });
    const keyIndex = dir.split("/").indexOf("<key>");

    const itemsData: { name: string; isDir: boolean; path: string; key?: string }[] = [];
    for await (const file of files) {
        const { name, ext } = path.parse(file);
        if (!ext || ext === ".json") {
            itemsData.push({
                name,
                isDir: !ext,
                path: path.posix.join(process.cwd(), file),
                key: keyIndex !== -1 ? file.split("/")[keyIndex] : undefined,
            });
        }
    }
    return itemsData;
};

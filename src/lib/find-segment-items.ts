import { type SegmentItem } from "./types";
import { readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const getItems = async (dir: string) => {
    const absoluteDir = path.join(process.cwd(), dir);
    if (!existsSync(absoluteDir)) {
        return null;
    }

    const items = await readdir(absoluteDir, { withFileTypes: true });
    const itemsData: { name: string; isDir: boolean; path: string }[] = [];
    for await (const item of items) {
        const isDir = item.isDirectory();
        const { name, ext } = path.parse(item.name);
        if (isDir || ext === ".json") {
            itemsData.push({
                name,
                isDir,
                path: path.join(absoluteDir, item.name),
            });
        }
    }
    return itemsData;
};

export const findSegmentItems = async (dir: string): Promise<SegmentItem[] | null> => {
    if (dir.endsWith(".json")) {
        console.warn(`Can't find segment items in ${dir}`);
        return null;
    }

    const segments = dir.replace(/^\.\//, "").split("/");

    if (segments.includes("<key>")) {
        const [preDir, postDir] = dir.split("<key>");
        const itemsData = await getItems(preDir);

        if (itemsData === null) return null;

        const summary: SegmentItem[] = [];
        for await (const itemData of itemsData) {
            if (itemData.isDir) {
                const postDirAbsolute = path.join(preDir, itemData.name, postDir);
                const postDirItems = await getItems(postDirAbsolute);
                postDirItems?.forEach((postDirItem) => {
                    summary.push({ ...postDirItem, key: itemData.name });
                });
            }
        }

        return summary;
    } else {
        const itemsData = await getItems(dir);
        return itemsData;
    }
};

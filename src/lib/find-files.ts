import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const findFiles = async (pattern: string) => {
    const [dir, subPath] = pattern.split("<key>");
    const absoluteDir = path.join(process.cwd(), dir);
    const fileList = await fs.readdir(absoluteDir, { withFileTypes: true });

    const files = fileList.reduce<{ path: string; key: string }[]>((acc, cur) => {
        if (cur.isFile()) {
            if (cur.name.endsWith(subPath)) {
                const fullPath = path.join(absoluteDir, cur.name);
                acc.push({ path: fullPath, key: cur.name.replace(subPath, "") });
            }
        } else {
            const fullPath = path.join(absoluteDir, cur.name, subPath);
            if (existsSync(fullPath)) {
                acc.push({ path: fullPath, key: cur.name });
            }
        }
        return acc;
    }, []);

    if (!files.length) {
        console.error("Can not find files by pattern");
        process.exit();
    }

    return files;
};

import { readFile } from "fs/promises";

export const getFile = async (filePath: string) => {
    const dataRow = await readFile(filePath, { encoding: "utf-8", flag: "r+" });
    const data = dataRow ? JSON.parse(dataRow) : {};
    return data;
};

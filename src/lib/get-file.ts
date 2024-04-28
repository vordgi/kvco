import { readFile } from "fs/promises";

export const getFile = async (locale: string) => {
    const filePath = `./terms/${locale}.json`;
    const dataRow = await readFile(filePath, { encoding: "utf-8" });
    const data = dataRow ? JSON.parse(dataRow) : {};
    return data;
};

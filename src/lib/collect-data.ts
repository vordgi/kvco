import { type Values, type Item, type Files } from "./types";
import { getFile } from "./get-file";

const collectItems = (data: Item, fileKey: string, accData: { [key: string]: Values }, accKey: string) => {
    if (data === null && accKey.match(/\.[0-9]+$/)) return;

    if (data && typeof data === "object") {
        Object.entries(data).forEach(([key, value]) => {
            collectItems(value, fileKey, accData, accKey ? `${accKey}.${key}` : key);
        });
    } else {
        if (accKey in accData && (typeof accData[accKey] !== "object" || accData[accKey] === null)) {
            console.error(`Different schema for key "${accKey}" - inio will ignore this key`);
        } else {
            accData[accKey] ||= {};
            accData[accKey][fileKey] = data;
        }
    }
};

export const collectData = async (files: Files) => {
    const result: { [key: string]: Values } = {};
    for await (const fileData of files) {
        const data = await getFile(fileData.path);
        collectItems(data, fileData.key, result, "");
    }
    const sortedList = Object.entries(result)
        .map(([key, values]) => ({ key, values }))
        .sort((a, b) => a.key.localeCompare(b.key));
    return sortedList;
};

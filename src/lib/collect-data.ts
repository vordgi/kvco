import { type DataValues, type Item, type Files } from "./types";
import { getFile } from "./get-file";

type CollectedData = { [pattern: string]: { [key: string]: DataValues } };
type ResultData = {
    key: string;
    staticPart: string;
    values: DataValues;
}[];

const collectItems = (data: Item, fileKey: string, accData: CollectedData[string], accKey: string) => {
    if (data === null && accKey.match(/(^|\.)[0-9]+$/)) return;

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
    const result: CollectedData = {};
    for await (const fileData of files) {
        result[fileData.staticPart] ||= {};
        const data = await getFile(fileData.path);
        collectItems(data, fileData.key, result[fileData.staticPart], "");
    }
    const fullData = Object.entries(result).reduce<ResultData>((acc, [staticPart, data]) => {
        Object.entries(data).forEach(([key, values]) => {
            acc.push({ key, staticPart, values });
        });
        return acc;
    }, []);
    return fullData.sort((a, b) => a.key.localeCompare(b.key));
};

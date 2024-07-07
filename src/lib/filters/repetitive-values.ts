import { type File, type ResultData } from "../types";

// complex code, but the metrics justify it
export const filterRepetitiveValues = (data: ResultData, files: File[]): ResultData => {
    const { result } = data.reduce(
        (acc, item) => {
            let isSaved = false;
            Object.entries(item.values).forEach(([key, value]) => {
                if (!value) return;

                if (!isSaved && acc.repetitiveValues[key].includes(value)) {
                    acc.result.push(item);
                    isSaved = true;
                } else if (!isSaved && value in acc.uniqData[key]) {
                    acc.repetitiveValues[key].push(value);
                    acc.result.push(acc.uniqData[key][value], item);
                    delete acc.uniqData[key][value];
                    isSaved = true;
                } else {
                    acc.uniqData[key][value] = item;
                }
            });
            return acc;
        },
        {
            uniqData: Object.fromEntries(
                files.map((fileData) => [fileData.key, {} as { [key: string]: ResultData[number] }]),
            ),
            repetitiveValues: Object.fromEntries(files.map((fileData) => [fileData.key, [] as string[]])),
            result: [] as ResultData,
        },
    );
    return result;
};

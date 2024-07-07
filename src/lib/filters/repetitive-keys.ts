import { type ResultData } from "../types";

// complex code, but the metrics justify it
export const filterRepetitiveKeys = (data: ResultData): ResultData => {
    const { result } = data.reduce(
        (acc, item) => {
            if (acc.repetitiveKeys.includes(item.key)) {
                acc.result.push(item);
            } else if (item.key in acc.uniqData) {
                acc.repetitiveKeys.push(item.key);
                acc.result.push(acc.uniqData[item.key], item);
                delete acc.uniqData[item.key];
            } else {
                acc.uniqData[item.key] = item;
            }
            return acc;
        },
        {
            uniqData: {} as { [key: string]: ResultData[number] },
            repetitiveKeys: [] as string[],
            result: [] as ResultData,
        },
    );
    return result;
};

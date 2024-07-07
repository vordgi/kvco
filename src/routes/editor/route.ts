import { type ServerResponse } from "http";
import { type InioRequest } from "../../lib/types";
import { collectData } from "../../lib/collect-data";
import { filterRepetitiveKeys } from "../../lib/filters/repetitive-keys";
import { filterRepetitiveValues } from "../../lib/filters/repetitive-values";

export const GET = async (req: InioRequest, res: ServerResponse) => {
    const search = req.url.searchParams.get("s");
    const page = req.url.searchParams.get("p");
    const countOnPage = req.url.searchParams.get("c");
    const data = await collectData(req.config.files);
    let resultData = data;
    if (search) {
        resultData = data.filter((item) => item.key.includes(search));
    }
    if (req.config.filters.missings) {
        resultData = resultData.filter((item) => req.config.files.some((fileData) => !item.values[fileData.key]));
    }
    if (req.config.filters.repetitiveKeys) {
        resultData = filterRepetitiveKeys(resultData);
    }
    if (req.config.filters.repetitiveValues) {
        resultData = filterRepetitiveValues(resultData, req.config.files);
    }
    let paginatedData = resultData;
    if (page && countOnPage) {
        paginatedData = resultData.slice((+page - 1) * +countOnPage, +page * +countOnPage);
    }
    return res.end(
        JSON.stringify({
            list: paginatedData,
            keys: req.config.files.reduce<string[]>((acc, { key }) => {
                if (!acc.includes(key)) acc.push(key);
                return acc;
            }, []),
            total: resultData.length,
        }),
    );
};

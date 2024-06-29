import { type ServerResponse } from "http";
import { InioRequest } from "../../lib/types";
import { collectData } from "../../lib/collect-data";

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
        resultData = resultData.filter((item) => req.config.files.some(({ key }) => !item.values[key]));
    }
    let paginatedData = resultData;
    if (page && countOnPage) {
        paginatedData = resultData.slice((+page - 1) * +countOnPage, +page * +countOnPage);
    }
    return res.end(
        JSON.stringify({
            list: paginatedData,
            keys: req.config.files.map(({ key }) => key),
            total: resultData.length,
        }),
    );
};

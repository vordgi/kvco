import { type ServerResponse } from "http";
import { type InioRequest } from "../../lib/types";

export const GET = async (req: InioRequest, res: ServerResponse) => {
    return res.end(JSON.stringify(req.config));
};

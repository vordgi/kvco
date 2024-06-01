import { type IncomingMessage, type ServerResponse } from "http";
import { type Config } from "../../lib/types";

const configRoute = async (req: IncomingMessage & { url: URL }, res: ServerResponse, config: Config) => {
    const method = req.method?.toLowerCase();

    try {
        if (method === "get") {
            return res.end(JSON.stringify(config));
        }
        return res.end();
    } catch (e) {
        console.log(`error on ${method}`, e);
    }
};

export default configRoute;

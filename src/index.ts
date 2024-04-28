#! /usr/bin/env node
import { createServer as createHttpServer } from "http";
import inioRoute from "./routes/inio";
import getConfig from "./lib/get-config";

const inio = async () => {
    const config = await getConfig();

    const server = createHttpServer(async (req, res) => {
        if (!req.url) return res.end();

        const url = new URL(req.url, "http://n");

        if (url.pathname === "/inio/") return inioRoute(Object.assign(req, { url }), res, config);

        return res.end();
    });

    server.listen(8000, () => {
        console.log("inio: Server runned, visit https://inio.nimpl.com to continue");
    });
};

inio();

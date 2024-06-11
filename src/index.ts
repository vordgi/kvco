#! /usr/bin/env node
import { createServer as createHttpServer } from "http";
import { getConfig } from "./lib/get-config";
import { isObjectKey } from "./lib/tools";
import { routes } from "./routes";

const HELP = `
To configure inio, create an "inio.config.js" file in the .json files directory
Options:
- pattern - the pattern by which to search for files. The pattern should contain a dynamic part <key>, f.e. "./terms/<key>.json" (by default "./<key>.json")

Now simply call "inio" in the terminal:
> inio


You can also specify the path to the config by setting the "CONFIG_PATH" environment variable:
> CONFIG_PATH="../../inio.config.js" inio


You can also pass package options through environment variables, converting options to UPPER_SNAKE_CASE format:
> PATTERN="./terms/<key>.json" inio
`;

if (process.argv.includes("help")) {
    console.log(HELP);
    process.exit();
}

const inio = async () => {
    const config = await getConfig();
    const server = createHttpServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.setHeader("Access-Control-Allow-Private-Network", "true");

        if (!req.url || !req.method) return res.end();

        const url = new URL(req.url, "http://n");
        const pathname = url.pathname;
        const method = req.method.toUpperCase();

        if (process.env.DEBUG) {
            console.log(`${method} ${url.toString().replace("http://n", "")}`);
        }

        if (method === "OPTIONS") return res.end();

        if (!isObjectKey(pathname, routes)) {
            res.statusCode = 404;
            return res.end();
        }

        const route = routes[pathname];
        if (!isObjectKey(method, route)) {
            res.statusCode = 404;
            return res.end();
        }

        return route[method](Object.assign(req, { url, config }), res);
    });

    server.listen(8000, () => {
        console.log("inio: Server runned, visit https://inio.nimpl.tech/edit to continue");
    });
};

inio();

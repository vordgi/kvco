#! /usr/bin/env node
import { createServer as createHttpServer } from "http";
import { readFile, writeFile } from "fs/promises";

type QueueItem =
    | {
          type: "update";
          term: string;
          value: string;
      }
    | {
          type: "create";
          term: string;
      }
    | {
          type: "delete";
          term: string;
      };

const queue: { [locale: string]: QueueItem[] } = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const process: { [locale: string]: Promise<any> } = {};

const getFile = async (locale: string) => {
    const filePath = `./terms/${locale}.json`;
    const termsRow = await readFile(filePath, { encoding: "utf-8" });
    const terms = termsRow ? JSON.parse(termsRow) : {};
    return terms;
};

const updateFile = async (locale: string) => {
    const queueLength = queue[locale].length;
    const processQueue = queue[locale].splice(0, queueLength);
    const terms = await getFile(locale);

    for await (const queueItem of processQueue) {
        if (queueItem.type === "create") {
            terms[queueItem.term] = "";
        } else if (queueItem.type === "update") {
            terms[queueItem.term] = queueItem.value;
        } else if (queueItem.type === "delete") {
            delete terms[queueItem.term];
        }
    }
    writeFile(`./terms/${locale}.json`, JSON.stringify(terms, null, 4), "utf-8");
    console.log(`Updated ${locale} terms, changes count: ${queueLength}`);

    const nextChangesCount = queue[locale].length;

    if (nextChangesCount) {
        process[locale] = updateFile(locale);
    } else {
        delete process[locale];
    }
};

const makeChanges = (item: QueueItem, locale: string) => {
    if (!queue[locale]) queue[locale] = [];

    queue[locale].push(item);

    if (locale in process) return;

    process[locale] = updateFile(locale);
};

const inio = async () => {
    const server = createHttpServer(async (req, res) => {
        if (!req.url) return res.end();

        const url = new URL(req.url, "http://n");

        if (url.pathname !== "/i18n/") return res.end();

        const method = req.method?.toLowerCase();

        try {
            const term = url.searchParams.get("term") || "";
            const value = url.searchParams.get("value") || "";
            const locale = url.searchParams.get("locale") || "";

            if (method === "get") {
                const terms = await getFile(locale);
                return res.end(JSON.stringify(terms));
            }

            if (method === "post") {
                console.log(`Create term "${term}"`);
                makeChanges(
                    {
                        term,
                        type: "create",
                    },
                    locale,
                );
                return res.end();
            }

            if (method === "delete") {
                console.log(`Delete term "${term}"`);
                makeChanges(
                    {
                        term,
                        type: "delete",
                    },
                    locale,
                );
                return res.end();
            }

            if (method === "put") {
                console.log(`Update term "${term}"`);
                makeChanges(
                    {
                        term,
                        type: "update",
                        value: value || "",
                    },
                    locale,
                );
                return res.end();
            }
            return res.end();
        } catch (e) {
            console.log(`error on ${method}`, e);
        }
    });
    server.listen(8000, () => {
        console.log("inio: Server runned, visit https://inio.nimpl.com to continue");
    });
};

inio();

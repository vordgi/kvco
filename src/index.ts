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
    const dataRow = await readFile(filePath, { encoding: "utf-8" });
    const data = dataRow ? JSON.parse(dataRow) : {};
    return data;
};

type Item = { [key: string]: Item } | string | undefined | null;

type Values = { [key: string]: string | undefined | null };

const collectItems = (data: Item, fileKey: string, accData: { [key: string]: Values }, accKey: string) => {
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

const collectData = async (fileKeys: string[]) => {
    const result: { [key: string]: Values } = {};
    for await (const fileKey of fileKeys) {
        const data = await getFile(fileKey);
        collectItems(data, fileKey, result, "");
    }
    const sortedList = Object.entries(result)
        .map(([key, values]) => ({ key, values }))
        .sort((a, b) => a.key.localeCompare(b.key));
    return sortedList;
};

const isNested = (nestingItem: Item, segment: string): nestingItem is { [key: string]: Item } => {
    return Boolean(nestingItem && typeof nestingItem === "object" && nestingItem[segment]);
};

const isObject = (nestingItem: Item): nestingItem is { [key: string]: Item } => {
    return Boolean(nestingItem && typeof nestingItem === "object");
};

const updateFile = async (locale: string) => {
    const queueLength = queue[locale].length;
    const processQueue = queue[locale].splice(0, queueLength);
    const terms = await getFile(locale);

    for await (const queueItem of processQueue) {
        const segments = queueItem.term.split(".");
        let term = terms;
        if (queueItem.type === "create") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    term[segment] = "";
                } else {
                    term[segment] ||= {};
                    term = term[segment];
                }
            }
        } else if (queueItem.type === "update") {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    term[segment] = queueItem.value;
                } else {
                    term[segment] ||= {};
                    term = term[segment];
                }
            }
        } else if (queueItem.type === "delete") {
            const nestingList: { segment: string; item: Item }[] = [];
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (i === segments.length - 1) {
                    delete term[segment];
                    for (let x = nestingList.length - 1; x >= 0; x--) {
                        const nestingItem = nestingList[x];

                        if (isNested(nestingItem.item, nestingItem.segment)) {
                            const nestedItem = nestingItem.item[nestingItem.segment];
                            if (isObject(nestedItem) && Object.keys(nestedItem).length === 0) {
                                delete nestingItem.item[nestingItem.segment];
                                continue;
                            }
                        }
                        break;
                    }
                } else {
                    nestingList.push({ item: term, segment });
                    term = term[segment];
                }
            }
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

        if (url.pathname !== "/inio/") return res.end();

        const method = req.method?.toLowerCase();

        try {
            const term = url.searchParams.get("term") || "";
            const value = url.searchParams.get("value") || "";
            const locale = url.searchParams.get("locale") || "";

            if (method === "get") {
                const terms = await collectData(["en", "de"]);
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

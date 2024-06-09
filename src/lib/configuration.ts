import { type Files } from "./types";
import { findSegmentItems } from "./find-segment-items";
import { version } from "../../package.json";
import path from "path";

export class Configuration {
    private _pattern: string;

    files: Files;

    version = version;

    constructor(pattern: string, files: Configuration["files"]) {
        this._pattern = pattern;
        this.files = files;
    }

    get pattern() {
        return this._pattern;
    }

    static async loadFiles(pattern: string) {
        const { dir, name, ext } = path.parse(pattern);

        if (ext !== ".json") return [];

        const items = await findSegmentItems(dir);
        const files = items?.reduce<Files>((acc, cur) => {
            if ((cur.name === name || name === "<key>") && !cur.isDir) {
                acc.push({
                    path: cur.path,
                    key: name === "<key>" ? cur.name : cur.key || "N/A",
                });
            }
            return acc;
        }, []);

        return files || [];
    }

    async updatePattern(pattern: string) {
        const files = await Configuration.loadFiles(pattern);
        this.files = files;
        this._pattern = pattern;
    }
}

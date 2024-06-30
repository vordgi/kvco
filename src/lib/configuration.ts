import { type Files, type ConfigurationOptions } from "./types";
import { findSegmentItems } from "./find-segment-items";
import { version } from "../../package.json";
import path from "path";

export class Configuration {
    private _pattern: string;

    files: Files;

    version = version;

    indent: string;

    filters: {
        missings?: boolean;
    } = {};

    constructor(options: ConfigurationOptions, files: Configuration["files"]) {
        const { pattern, indentSize, indentType } = options;
        Configuration.preventInvalidPattern(pattern);
        this._pattern = pattern;
        this.files = files;
        this.indent = indentType === "tab" ? "\t".repeat(indentSize) : " ".repeat(indentSize);
    }

    get pattern() {
        return this._pattern;
    }

    static validatePattern(pattern: string) {
        const isInScope = !path.relative(process.cwd(), path.join(process.cwd(), pattern)).startsWith("..");
        return isInScope;
    }

    static preventInvalidPattern(pattern: string) {
        if (!Configuration.validatePattern(pattern)) {
            console.log(`Invalid pattern: "${pattern}". It goes beyond tool scope`);
            process.exit();
        }
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
        Configuration.preventInvalidPattern(pattern);
        const files = await Configuration.loadFiles(pattern);
        this.files = files;
        this._pattern = pattern;
    }

    async updateFilters(filters: { [key: string]: string }) {
        this.filters = filters;
    }
}

import { type Files, type ConfigurationOptions } from "./types";
import { findSegmentItems } from "./find-segment-items";
import { version } from "../../package.json";
import path from "path";

export class Configuration {
    private _pattern: string | string[];

    files: Files;

    version = version;

    indent: string;

    filters: {
        missings?: boolean;
        repetitiveKeys?: boolean;
        repetitiveValues?: boolean;
    } = {};

    ignore?: string[];

    experimental?: unknown;

    constructor(options: ConfigurationOptions, files: Configuration["files"]) {
        const { pattern, ignore, indentSize, indentType, experimental } = options;
        this._pattern = pattern;
        this.ignore = ignore;
        this.files = files;
        this.experimental = experimental;
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
        if (!pattern) {
            console.error(
                `Invalid pattern: "${pattern}". Provide files pattern, call "inio help" for more information`,
            );
            process.exit();
        }
        if (!pattern.includes("<key>")) {
            console.error(
                `Invalid pattern: "${pattern}". Provide key in files pattern, call "inio help" for more information`,
            );
            process.exit();
        }
        if (!Configuration.validatePattern(pattern)) {
            console.log(`Invalid pattern: "${pattern}". It goes beyond tool scope`);
            process.exit();
        }
    }

    static preventInvalidPatterns(pattern: string | string[]) {
        if (typeof pattern === "string") {
            Configuration.preventInvalidPattern(pattern);
        } else {
            pattern.forEach((pt) => Configuration.preventInvalidPattern(pt));
        }
    }

    static async loadPatternFiles(pattern: string, otherPatterns: string[] = [], ignore: string | string[] = []) {
        const { name, ext } = path.parse(pattern);

        if (ext !== ".json") return [];

        const items = await findSegmentItems(pattern.replace(/^\.\//, ""), otherPatterns, ignore);

        const files = items?.reduce<Files>((acc, cur) => {
            if (!cur.isDir) {
                acc.push({
                    staticPart: cur.staticPart,
                    path: cur.path,
                    key: name === "<key>" ? cur.name : cur.key || "N/A",
                });
            }
            return acc;
        }, []);

        return files || [];
    }

    static async loadFiles(pattern: string | string[], ignore: string | string[]) {
        if (typeof pattern === "string") {
            return this.loadPatternFiles(pattern, [], ignore);
        }
        const allItems = await Promise.all(
            pattern.map((pt) =>
                this.loadPatternFiles(
                    pt,
                    pattern.filter((i) => i !== pt),
                    ignore,
                ),
            ),
        );
        return allItems.flat().sort((a, b) => a.key.localeCompare(b.key));
    }

    async updatePattern(pattern: string | string[]) {
        Configuration.preventInvalidPatterns(pattern);
        const files = await Configuration.loadFiles(pattern, this?.ignore || []);
        this.files = files;
        this._pattern = pattern;
    }

    async updateIgnore(ignore: string[]) {
        const files = await Configuration.loadFiles(this.pattern, ignore || []);
        this.files = files;
        this.ignore = ignore;
    }

    async updateFilters(filters: { [key: string]: string }) {
        this.filters = filters;
    }
}

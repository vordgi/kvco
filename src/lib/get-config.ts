import path from "path";
import { existsSync } from "fs";
import { Configuration } from "./configuration";

const DEFAULT_PATTERN = "<key>.json";
const DEFAULT_CONFIG_PATH = "./kvco.config.js";
const DEFAULT_INDENT_TYPE = "space";
const DEFAULT_INDENT_SIZE = 4;

export const getConfig = async (): Promise<Configuration> => {
    const kvcoConfigPath = path.join(process.cwd(), process.env.CONFIG_PATH || DEFAULT_CONFIG_PATH);
    let kvcoConfig;
    if (existsSync(kvcoConfigPath)) {
        const kvcoConfigModule = await import(kvcoConfigPath);
        kvcoConfig = kvcoConfigModule.default;
    }
    const pattern = process.env.PATTERN || kvcoConfig?.pattern || DEFAULT_PATTERN;
    Configuration.preventInvalidPatterns(pattern);
    const ignore = process.env.IGNORE || kvcoConfig?.ignore;

    const indentType = process.env.INDENT_TYPE || kvcoConfig?.indent?.type || DEFAULT_INDENT_TYPE;
    const indentSize = process.env.INDENT_size || kvcoConfig?.indent?.size || DEFAULT_INDENT_SIZE;

    const files = await Configuration.loadFiles(pattern, ignore);
    return new Configuration(
        { pattern, ignore, indentType, indentSize, experimental: kvcoConfig?.experimental },
        files,
    );
};

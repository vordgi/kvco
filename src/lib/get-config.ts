import path from "path";
import { existsSync } from "fs";
import { Configuration } from "./configuration";

const DEFAULT_PATTERN = "<key>.json";
const DEFAULT_CONFIG_PATH = "./inio.config.js";
const DEFAULT_INDENT_TYPE = "space";
const DEFAULT_INDENT_SIZE = 4;

export const getConfig = async (): Promise<Configuration> => {
    const inioConfigPath = path.join(process.cwd(), process.env.CONFIG_PATH || DEFAULT_CONFIG_PATH);
    let inioConfig;
    if (existsSync(inioConfigPath)) {
        const inioConfigModule = await import(inioConfigPath);
        inioConfig = inioConfigModule.default;
    }
    const pattern = process.env.PATTERN || inioConfig?.pattern || DEFAULT_PATTERN;
    Configuration.preventInvalidPatterns(pattern);
    const ignore = process.env.IGNORE || inioConfig?.ignore;

    const indentType = process.env.INDENT_TYPE || inioConfig?.indent?.type || DEFAULT_INDENT_TYPE;
    const indentSize = process.env.INDENT_size || inioConfig?.indent?.size || DEFAULT_INDENT_SIZE;

    const files = await Configuration.loadFiles(pattern, ignore);
    return new Configuration(
        { pattern, ignore, indentType, indentSize, experimental: inioConfig?.experimental },
        files,
    );
};

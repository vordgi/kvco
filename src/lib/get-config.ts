import path from "path";
import { existsSync } from "fs";
import { findFiles } from "./find-files";

const DEFAULT_PATTERN = "./<key>.json";

export const getConfig = async () => {
    const inioConfigPath = path.join(process.cwd(), "./inio.config.js");
    let inioConfig;
    if (existsSync(inioConfigPath)) {
        const inioConfigModule = await import(inioConfigPath);
        inioConfig = inioConfigModule.default;
    }
    const pattern = process.env.PATTERN || inioConfig?.pattern || DEFAULT_PATTERN;

    if (!pattern) {
        console.error('Provide files pattern, call "inio help" for more information');
        process.exit();
    }

    if (!pattern.includes("<key>")) {
        console.error('Provide key in files pattern, call "inio help" for more information');
        process.exit();
    }

    const files = await findFiles(pattern);
    return { files };
};

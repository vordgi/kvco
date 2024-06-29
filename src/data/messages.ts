export const HELP = `
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

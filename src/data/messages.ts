export const HELP = `
To configure kvco, create an "kvco.config.js" file in the .json files directory
Options:
- pattern - the pattern by which to search for files. The pattern should contain a dynamic part <key>, f.e. "./terms/<key>.json" (by default "./<key>.json")

Now simply call "kvco" in the terminal:
> kvco


You can also specify the path to the config by setting the "CONFIG_PATH" environment variable:
> CONFIG_PATH="../../kvco.config.js" kvco


You can also pass package options through environment variables, converting options to UPPER_SNAKE_CASE format:
> PATTERN="./terms/<key>.json" kvco
`;

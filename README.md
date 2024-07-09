# k-v

Utility for editing a group of JSON files

## Features

Creation - create a key that will be added to all files that match the pattern

Editing - correct the values of nested keys in each file

Deletion - delete the key from all files

## Installation

```bash
npm install k-v -g
```

## Usage

```bash
k-v
```

or

```bash
kv
```

## Configuration

To configure **inio**, create an `inio.config.js` file in the `.json` files directory

**Options**

`pattern` - the pattern by which to search for files. The pattern should contain a dynamic part `<key>`, f.e. "`./terms/<key>.json`" (by default "`./<key>.json`")

Now simply call `inio` in the terminal:

```bash
inio
```

You can also specify the path to the config by setting the `CONFIG_PATH` environment variable:

```bash
CONFIG_PATH="../../inio.config.js" inio
```

You can also pass package options through environment variables, converting options to **UPPER_SNAKE_CASE** format:

```bash
PATTERN="./terms/<key>.json" inio
```

Where `./terms/<key>.json` - is the pattern of files that you want to edit, with the following file structure:

```
root
--langs
----en.json
----de.json
----fr.json
```

The pattern should contain `<key>` - this is a dynamic parameter, equivalent to `*` in glob rules.

The utility will start a local server, through which all your file changes will subsequently occur.

Then open [inio.nimpl.tech](https://inio.nimpl.tech/) and edit the files through a comfortable interface.

![application screenshot](docs/app.png)

## Additional

Please consider giving a star if you like it, it shows that the package is useful and helps continue work on this and other packages.

Create tasks with wishes, ideas, difficulties, etc. All of them will definitely be considered and thought over.

## License

[BSD-1-Clause](https://github.com/vordgi/nimpl-inio/blob/main/LICENSE)

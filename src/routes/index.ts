import * as editorRoute from "./editor/route";
import * as configRoute from "./config/route";
import * as fileSystemRoute from "./file-system/route";
import * as searchFilesRoute from "./search-files/route";

export const routes = {
    "/editor/": editorRoute,
    "/config/": configRoute,
    "/file-system/": fileSystemRoute,
    "/search-files/": searchFilesRoute,
};

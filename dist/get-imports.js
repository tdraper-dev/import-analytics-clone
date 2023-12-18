"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImports = void 0;
const node_fs_1 = require("node:fs");
const get_file_paths_1 = require("./get-file-paths");
// source: https://regexr.com/7ooba
const MATCH_AS_KEYWORD_IMPORT = /(\S+?)\s+?as/;
// source: https://regexr.com/7oh1p
const getImportRegex = (importPath) => {
    // return new RegExp(`import\\s+{([\\s,\\S]+?)}\\s+from\\s+[',"]${importPath}[',"]`, 'g');
    return new RegExp(`import\\s+{([^}]+?)}\\s+from\\s+[',"]${importPath}[',"]`, "g");
};
const findImports = (file, imports, library) => {
    return ([...file.matchAll(getImportRegex(library))]
        // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll#:~:text=access%20capture%20groups
        // get first instance of matched group (all the import instances)
        .map((matches) => matches[1])
        // split on comma (,)
        .map((importInstances) => importInstances
        .split(",")
        // remove white space
        .map((importInstance) => importInstance.trim())
        // Handle import instances that use `as` keywords
        .map((importInstance) => {
        // Check for `as` keyword
        const importUsingAsKeyword = importInstance.match(MATCH_AS_KEYWORD_IMPORT)?.[1];
        if (importUsingAsKeyword) {
            return importUsingAsKeyword;
        }
        return importInstance;
    })
        // grab only the imports we care about
        .filter((importInstance) => imports.includes(importInstance)))
        // combine all matches into one array
        .flat()
        // remove empty "instances" (when import uses trailing comma)
        .filter((importInstance) => !!importInstance));
    // // remove commented out instances
    // .filter(importInstance => !importInstance.startsWith('/'));
};
async function getImports(repoPath, library) {
    const libraryFiles = await (0, get_file_paths_1.getFilePaths)(repoPath, `/**/*.@(${["ts", "tsx"].join("|")})`);
    return libraryFiles
        .map((filePath) => (0, node_fs_1.readFileSync)(filePath, "utf8"))
        .map((file) => findImports(file, library.imports, library.name))
        .flat()
        .reduce((acc, curr) => {
        if (!acc[curr])
            acc[curr] = { count: 0 };
        acc[curr].count += 1;
        return acc;
    }, {});
}
exports.getImports = getImports;

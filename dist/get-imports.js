"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImports = exports.getImportRegex = void 0;
// source: https://regexr.com/7oh1p
const getImportRegex = (importPath) => {
    // return new RegExp(`import\\s+{([\\s,\\S]+?)}\\s+from\\s+[',"]${importPath}[',"]`, 'g');
    return new RegExp(`import\\s+{([^}]+?)}\\s+from\\s+[',"]${importPath}[',"]`, 'g');
};
exports.getImportRegex = getImportRegex;
const getImports = (file, importPath) => {
    return [...file.matchAll((0, exports.getImportRegex)(importPath))]
        // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll#:~:text=access%20capture%20groups
        // get first instance of matched group (all the import instances)
        .map(matches => matches[1])
        // split on comma (,)
        .map(importInstances => importInstances.split(',')
        // remove white space
        .map(importInstance => importInstance.trim()))
        // combine all matches into one array
        .flat()
        // remove empty "instances" (when import uses trailing comma)
        .filter(importInstance => !!importInstance);
    // // remove commented out instances
    // .filter(importInstance => !importInstance.startsWith('/'));
};
exports.getImports = getImports;

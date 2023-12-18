"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePaths = void 0;
const node_path_1 = require("node:path");
const glob_1 = require("glob");
async function getFilePaths(repoPath, wildcard) {
    return await (0, glob_1.glob)((0, node_path_1.join)(repoPath, wildcard), {
        // Support Windows paths
        windowsPathsNoEscape: true,
        // Don't capture directories
        nodir: true,
        // Shouldn't be needed, but just in case
        ignore: ["**/node_modules/**"],
    });
}
exports.getFilePaths = getFilePaths;

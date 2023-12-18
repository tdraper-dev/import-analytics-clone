"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependencies = void 0;
const node_fs_1 = require("node:fs");
const get_file_paths_1 = require("./get-file-paths");
async function getDependencies(repoPath, dependencies) {
    if (!dependencies)
        return {};
    const matchedDependencies = dependencies.reduce((acc, curr) => {
        acc[curr] = false;
        return acc;
    }, {});
    // check package.json files for dependencies
    const dependenciesFiles = await (0, get_file_paths_1.getFilePaths)(repoPath, "/**/package.json");
    for (let i = 0; i < dependenciesFiles.length; i++) {
        const filePath = dependenciesFiles[i];
        const packageJson = JSON.parse((0, node_fs_1.readFileSync)(filePath, "utf8"));
        const { dependencies: deps, peerDependencies: peerDeps, devDependencies: devDeps, } = packageJson;
        for (const dependency of dependencies) {
            if (deps?.[dependency] ||
                peerDeps?.[dependency] ||
                devDeps?.[dependency]) {
                if (!matchedDependencies[dependency]) {
                    matchedDependencies[dependency] = true;
                    break;
                }
            }
        }
    }
    return matchedDependencies;
}
exports.getDependencies = getDependencies;

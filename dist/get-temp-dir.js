"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTempDir = void 0;
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
const tmpDir = (0, node_os_1.tmpdir)();
const getTempDir = () => {
    // Temporary directory based on os
    // return mkdtempSync(`${tmpDir}${sep}`);
    // Local directory
    return (0, node_path_1.join)(__dirname, "../temp");
};
exports.getTempDir = getTempDir;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalTempDir = exports.getTempDir = void 0;
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const node_os_1 = require("node:os");
const tmpDir = (0, node_os_1.tmpdir)();
const getTempDir = () => {
    // Temporary directory based on os
    return (0, node_fs_1.mkdtempSync)(`${tmpDir}${node_path_1.sep}`);
    // return getLocalTempDir();
};
exports.getTempDir = getTempDir;
// Local directory (for debugging)
const getLocalTempDir = () => (0, node_path_1.join)(__dirname, "../temp");
exports.getLocalTempDir = getLocalTempDir;

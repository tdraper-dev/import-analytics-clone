"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const glob_1 = require("glob");
const node_fs_1 = require("node:fs");
const get_imports_1 = require("./get-imports");
const git_clone_1 = require("./git-clone");
const get_temp_dir_1 = require("./get-temp-dir");
main();
async function main() {
    const dir = (0, get_temp_dir_1.getTempDir)();
    const projectName = "eslint-plugin";
    const projectPath = (0, node_path_1.join)(dir, projectName);
    const cleanup = await (0, git_clone_1.gitClone)({ projectPath, projectName, author: 'bitovi', hosting: "github", username: "m-thompson-code", protocol: "https" });
    const ext = ["ts"];
    const filePaths = await (0, glob_1.glob)((0, node_path_1.join)(projectPath, `/**/*.@(${ext.join("|")})`));
    console.log(filePaths);
    const imports = filePaths
        .map((filePath) => (0, node_fs_1.readFileSync)(filePath, "utf8"))
        .map((file) => (0, get_imports_1.getImports)(file, "@angular/core"))
        .flat();
    console.log(imports);
    cleanup();
}

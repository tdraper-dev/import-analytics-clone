"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const get_temp_dir_1 = require("./get-temp-dir");
const get_output_1 = require("./get-output");
const errors_1 = require("./errors");
main();
async function main() {
    const dir = (0, get_temp_dir_1.getTempDir)();
    if (!(0, node_fs_1.existsSync)(__dirname + "/../input.json")) {
        throw new Error("input.json not found");
    }
    const input = JSON.parse((0, node_fs_1.readFileSync)(__dirname + "/../input.json", "utf8"));
    const output = await (0, get_output_1.getOutput)(dir, input);
    (0, node_fs_1.writeFileSync)(__dirname + "/../output.json", JSON.stringify(output, null, 2));
    const errorCount = (0, errors_1.getErrors)().length;
    const repoCount = Object.keys(input.repos).length;
    console.log(`Repos ${repoCount} Success ${repoCount - errorCount} Errors ${errorCount}`);
    (0, errors_1.writeErrorsJson)();
    if (errorCount) {
        console.log("Open `errors.json` to view errors");
    }
}

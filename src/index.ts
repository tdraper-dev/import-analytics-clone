import { join } from "node:path";
import { glob } from "glob";
import { readFileSync } from "node:fs";
import { getImports } from "./get-imports";
import { gitClone } from "./git-clone";
import { getTempDir } from "./get-temp-dir";

main();

async function main() {
    const dir = getTempDir();

    const projectName = "eslint-plugin";

    const projectPath = join(dir, projectName);

    const cleanup = await gitClone({ projectPath, projectName, author: 'bitovi', hosting: "github", username: "m-thompson-code", protocol: "https" });

    const ext = ["ts"];
    const filePaths = await glob(join(projectPath, `/**/*.@(${ext.join("|")})`));

    console.log(filePaths);
    const imports = filePaths
        .map((filePath) => readFileSync(filePath, "utf8"))
        .map((file) => getImports(file, "@angular/core"))
        .flat();

    console.log(imports);

    cleanup();
}

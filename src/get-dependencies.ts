import { readFileSync } from "node:fs";
import { getFilePaths } from "./get-file-paths";
import type { Input, Output, Repo } from "./types";

export async function getDependencies(
  repoPath: Repo["name"],
  dependencies: Input["dependencies"],
): Promise<Output["repos"][string]["dependencies"]> {
  if (!dependencies) return {};

  const matchedDependencies = dependencies.reduce((acc, curr) => {
    acc[curr] = false;
    return acc;
  }, {});

  // check package.json files for dependencies
  const dependenciesFiles = await getFilePaths(repoPath, "/**/package.json");

  for (let i = 0; i < dependenciesFiles.length; i++) {
    const filePath = dependenciesFiles[i];
    const packageJson = JSON.parse(readFileSync(filePath, "utf8"));
    const {
      dependencies: deps,
      peerDependencies: peerDeps,
      devDependencies: devDeps,
    } = packageJson;

    for (const dependency of dependencies) {
      if (
        deps?.[dependency] ||
        peerDeps?.[dependency] ||
        devDeps?.[dependency]
      ) {
        if (!matchedDependencies[dependency]) {
          matchedDependencies[dependency] = true;
          break;
        }
      }
    }
  }

  return matchedDependencies;
}

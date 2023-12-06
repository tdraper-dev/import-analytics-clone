import { join } from "node:path";
import { readFileSync } from "node:fs";
import { glob } from "glob";
import { getImports } from "./get-imports";
import { gitClone } from "./git-clone";
import { storeError } from './errors';
import type { Input, Output, Repo } from "./types";

const getProjectOutput = async (dir: string, input: Input, repo: Repo) => {
  console.log(dir, input, repo);
  const { imports, library, git } = input;
  const { name: repoName, git: gitOverride } = repo;

    const repoPath = join(dir, repoName);

    const cleanup = await gitClone({
      branch: gitOverride?.branch || git.branch,
      repoPath,
      repoName,
      owner: gitOverride?.owner || git.owner,
      hosting: gitOverride?.hosting || git.hosting,
      username: gitOverride?.username || git.username,
      protocol: gitOverride?.protocol || git.protocol,
    });

    const ext = ["ts", "tsx"];
    const filePaths = await glob(join(repoPath, `/**/*.@(${ext.join("|")})`), { windowsPathsNoEscape: true });

    const matchedImports = filePaths
      .map((filePath) => readFileSync(filePath, "utf8"))
      .map((file) => getImports(file, imports, library))
      .flat()
      .reduce((acc, curr) => {
        if (!acc[curr]) acc[curr] = { count: 0 };
        acc[curr].count += 1;
        return acc;
      }, {});

    cleanup();

    return { matchedImports, importsUsed: Object.keys(matchedImports).length };
}

export async function getOutput(dir: string, input: Input): Promise<Output> {
  const { imports, repos } = input;

  const output: Output = {
    metadata: {
      date: new Date().toISOString().split("T")[0],
      reposThatIncludeImports: 0, // TODO
      reposThatExcludesImports: 0, // TODO
    },
    repos: {},
  };

  for (const repo of repos) {
    try {
      const { matchedImports, importsUsed } = await getProjectOutput(dir, input, repo);

      output.repos[repo.name] = {
        importsUsed,
        importsNotUsed: imports.length - importsUsed,
        imports: matchedImports,
      };
    } catch(error) {
      console.error(error);
      storeError(error);
    }
  }

  return output;
}

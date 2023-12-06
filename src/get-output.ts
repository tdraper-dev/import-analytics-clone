import { join } from "node:path";
import { readFileSync } from "node:fs";
import { glob } from "glob";
import { getImports } from "./get-imports";
import { gitClone } from "./git-clone";
import type { Input, Output } from "./types";

export async function getOutput(dir: string, input: Input): Promise<Output> {
  const { imports, library, repos, git } = input;

  const output: Output = {
    metadata: {
      date: new Date().toISOString().split("T")[0],
      projectsThatIncludeImports: 0, // TODO
      projectsThatExcludesImports: 0, // TODO
    },
    projects: {},
  };

  for (let i = 0; i < repos.length; i++) {
    const { name: repo, git: gitOverride } = repos[i];

    const projectPath = join(dir, repo);

    const cleanup = await gitClone({
      branchName: gitOverride?.branch || git.branch,
      projectPath,
      projectName: repo,
      author: gitOverride?.author || git.author,
      hosting: gitOverride?.hosting || git.hosting,
      username: git.username,
      protocol: gitOverride?.protocol || git.protocol,
    });

    const ext = ["ts", "tsx"];
    const filePaths = await glob(join(projectPath, `/**/*.@(${ext.join("|")})`), { windowsPathsNoEscape: true });

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

    const importsUsed = Object.keys(matchedImports).length;

    output.projects[repo] = {
      importsUsed,
      importsNotUsed: imports.length - importsUsed,
      imports: matchedImports,
    };
  }

  return output;
}

import { join } from "node:path";
import { readFileSync } from "node:fs";
import { glob } from "glob";
import { getImports } from "./get-imports";
import { gitClone } from "./git-clone";
import type { Input } from ".";

export async function getOutput(dir: string, input: Input) {
  const { imports, library, repos, git } = input;

  const output = {
    metadata: {
      date: new Date().toISOString().split("T")[0],
    },
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

    const ext = ["ts"];
    const filePaths = await glob(
      join(projectPath, `/**/*.@(${ext.join("|")})`)
    );

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

    output[repo] = matchedImports;
  }

  return output;
}

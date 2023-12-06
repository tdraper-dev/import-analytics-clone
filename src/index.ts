import { join } from "node:path";
import { glob } from "glob";
import { readFileSync, writeFileSync } from "node:fs";
import { getImports } from "./get-imports";
import { gitClone } from "./git-clone";
import { getTempDir } from "./get-temp-dir";

main();

interface Input {
  imports: string[];
  library: string;
  repos: Array<{
    name: string;
    git?: {
      hosting?: "github" | "bitbucket";
      protocol?: "ssh" | "https";
      author?: string;
      branch?: string;
    };
  }>;
  git: {
    username: string;
    author: string;
    hosting: "github" | "bitbucket";
    protocol: "ssh" | "https";
    branch: string;
  };
}

async function main() {
  const dir = getTempDir();

  const { imports, library, repos, git }: Input = JSON.parse(
    readFileSync(__dirname + "/../input.json", "utf8")
  );

  const output = {
    metadata: {
      date: new Date().toISOString().split("T")[0],
    },
  };

  await Promise.all(
    repos.map(async ({ name: repo, git: gitOverride }) => {
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
    })
  );

  writeFileSync(__dirname + "/../output.json", JSON.stringify(output, null, 2));
}

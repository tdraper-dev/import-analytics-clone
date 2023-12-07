import { join } from "node:path";
import { readFileSync } from "node:fs";
import { getImports } from "./get-imports";
import { getFilePaths } from "./get-file-paths";
import { gitClone } from "./git-clone";
import { getDependencies } from "./get-dependencies";
import { storeError } from "./errors";
import type { Input, Output, Repo } from "./types";

const getProjectOutput = async (dir: string, input: Input, repo: Repo) => {
  const { library, dependencies, git } = input;
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

  const libraryFiles = await getFilePaths(
    repoPath,
    `/**/*.@(${["ts", "tsx"].join("|")})`
  );

  const matchedImports = libraryFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .map((file) => getImports(file, library.imports, library.name))
    .flat()
    .reduce((acc, curr) => {
      if (!acc[curr]) acc[curr] = { count: 0 };
      acc[curr].count += 1;
      return acc;
    }, {});

  const matchedDependencies = await getDependencies(repoPath, dependencies);

  cleanup();

  return {
    matchedImports,
    importsUsed: Object.keys(matchedImports).length,
    matchedDependencies,
  };
};

export async function getOutput(dir: string, input: Input): Promise<Output> {
  const { library, repos, dependencies } = input;

  const output: Output = {
    metadata: {
      date: new Date().toISOString().split("T")[0],
    },
    aggregates: {
      reposThatIncludeImports: [],
      reposThatExcludesImports: [],
      imports: {},
      dependencies: {},
    },
    repos: {},
  };

  for (const repo of repos) {
    try {
      const { matchedImports, importsUsed, matchedDependencies } =
        await getProjectOutput(dir, input, repo);

      output.repos[repo.name] = {
        dependencies: matchedDependencies,
        importsUsed,
        importsNotUsed: library.imports.length - importsUsed,
        imports: matchedImports,
      };

      if (importsUsed) {
        output.aggregates.reposThatIncludeImports.push(repo.name);
      } else {
        output.aggregates.reposThatExcludesImports.push(repo.name);
      }
    } catch (error) {
      console.error(error);
      storeError(error);
    }
  }

  output.aggregates.dependencies = dependencies
    ? dependencies.reduce((acc, curr) => {
        acc[curr] = {
          repoCount: 0,
        };
        return acc;
      }, {})
    : {};

  output.aggregates.imports = library.imports.reduce((acc, curr) => {
    acc[curr] = {
      instanceCount: 0,
      repoCount: 0,
    };
    return acc;
  }, {});

  for (const repoName in output.repos) {
    const repo = output.repos[repoName];

    for (const dependencyName in repo.dependencies) {
      if (repo.dependencies[dependencyName]) {
        output.aggregates.dependencies[dependencyName].repoCount += 1;
      }
    }

    for (const importName in repo.imports) {
      const importCount = repo.imports[importName].count;

      output.aggregates.imports[importName].instanceCount += importCount;
      output.aggregates.imports[importName].repoCount += 1;
    }
  }

  return output;
}

import { join } from "node:path";
import { getImports } from "./get-imports";
import { gitClone } from "./git-clone";
import { getDependencies } from "./get-dependencies";
import { calculateAggregates } from "./calculate-aggregates";
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

  const matchedImports = await getImports(repoPath, library);

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

  const aggregates = calculateAggregates(
    output.repos,
    library.imports,
    dependencies,
  );

  output.aggregates.dependencies = aggregates.dependencies;
  output.aggregates.imports = aggregates.imports;

  return output;
}

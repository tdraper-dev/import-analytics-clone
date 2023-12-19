import { join } from "node:path";
import { getImports } from "./get-imports";
import { gitClone, getLastCommitDate } from "./git-clone";
import { getDependencies } from "./get-dependencies";
import { calculateAggregates } from "./calculate-aggregates";
import { storeError } from "./errors";
import type { Input, Output, Repo } from "./types";

const getProjectOutput = async (
  dir: string,
  input: Input,
  repo: Repo,
): Promise<{
  matchedImports: Output["repos"][string]["imports"];
  importsUsed: Output["repos"][string]["importsUsed"];
  matchedDependencies: Output["repos"][string]["dependencies"];
  lastCommitDate: Output["repos"][string]["lastCommitDate"];
}> => {
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
    password: gitOverride?.password || git.password,
    protocol: gitOverride?.protocol || git.protocol,
  });

  const matchedImports = await getImports(repoPath, library);
  const matchedDependencies = await getDependencies(repoPath, dependencies);
  const lastCommitDate = await getLastCommitDate(repoPath);

  cleanup();

  return {
    matchedImports,
    importsUsed: Object.keys(matchedImports).length,
    matchedDependencies,
    lastCommitDate,
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
      const {
        matchedImports,
        importsUsed,
        matchedDependencies,
        lastCommitDate,
      } = await getProjectOutput(dir, input, repo);

      output.repos[repo.name] = {
        dependencies: matchedDependencies,
        importsUsed,
        importsNotUsed: library.imports.length - importsUsed,
        imports: matchedImports,
        lastCommitDate,
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
  console.log("LIBRARY", library);
  const aggregates = calculateAggregates(
    output.repos,
    library.imports,
    dependencies,
  );

  output.aggregates.dependencies = aggregates.dependencies;
  output.aggregates.imports = aggregates.imports;

  return output;
}

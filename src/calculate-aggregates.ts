import type { Output, Input } from "./types";

export function calculateAggregates(
  repos: Output["repos"],
  imports: Input["library"]["imports"],
  dependencies: Input["dependencies"],
): Pick<Output["aggregates"], "imports" | "dependencies"> {
  const aggregates = {
    dependencies: dependencies
      ? dependencies.reduce((acc, curr) => {
          acc[curr] = {
            repoCount: 0,
          };
          return acc;
        }, {})
      : {},
    imports: imports.reduce((acc, curr) => {
      acc[curr] = {
        instanceCount: 0,
        repoCount: 0,
      };
      return acc;
    }, {}),
  };

  for (const repoName in repos) {
    const repo = repos[repoName];

    for (const dependencyName in repo.dependencies) {
      if (repo.dependencies[dependencyName]) {
        aggregates.dependencies[dependencyName].repoCount += 1;
      }
    }

    for (const importName in repo.imports) {
      const importCount = repo.imports[importName].count;

      aggregates.imports[importName].instanceCount += importCount;
      aggregates.imports[importName].repoCount += 1;
    }
  }

  return aggregates;
}

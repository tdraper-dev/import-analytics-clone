"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutput = void 0;
const node_path_1 = require("node:path");
const get_imports_1 = require("./get-imports");
const git_clone_1 = require("./git-clone");
const get_dependencies_1 = require("./get-dependencies");
const calculate_aggregates_1 = require("./calculate-aggregates");
const errors_1 = require("./errors");
const getProjectOutput = async (dir, input, repo) => {
    const { library, dependencies, git } = input;
    const { name: repoName, git: gitOverride } = repo;
    const repoPath = (0, node_path_1.join)(dir, repoName);
    const cleanup = await (0, git_clone_1.gitClone)({
        branch: gitOverride?.branch || git.branch,
        repoPath,
        repoName,
        owner: gitOverride?.owner || git.owner,
        hosting: gitOverride?.hosting || git.hosting,
        username: gitOverride?.username || git.username,
        password: gitOverride?.password || git.password,
        protocol: gitOverride?.protocol || git.protocol,
    });
    const matchedImports = await (0, get_imports_1.getImports)(repoPath, library);
    const matchedDependencies = await (0, get_dependencies_1.getDependencies)(repoPath, dependencies);
    const lastCommitDate = await (0, git_clone_1.getLastCommitDate)(repoPath);
    cleanup();
    return {
        matchedImports,
        importsUsed: Object.keys(matchedImports).length,
        matchedDependencies,
        lastCommitDate,
    };
};
async function getOutput(dir, input) {
    const { library, repos, dependencies } = input;
    const output = {
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
            const { matchedImports, importsUsed, matchedDependencies, lastCommitDate, } = await getProjectOutput(dir, input, repo);
            output.repos[repo.name] = {
                dependencies: matchedDependencies,
                importsUsed,
                importsNotUsed: library.imports.length - importsUsed,
                imports: matchedImports,
                lastCommitDate,
            };
            if (importsUsed) {
                output.aggregates.reposThatIncludeImports.push(repo.name);
            }
            else {
                output.aggregates.reposThatExcludesImports.push(repo.name);
            }
        }
        catch (error) {
            console.error(error);
            (0, errors_1.storeError)(error);
        }
    }
    const aggregates = (0, calculate_aggregates_1.calculateAggregates)(output.repos, library.imports, dependencies);
    output.aggregates.dependencies = aggregates.dependencies;
    output.aggregates.imports = aggregates.imports;
    return output;
}
exports.getOutput = getOutput;

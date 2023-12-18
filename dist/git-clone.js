"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastCommitDate = exports.cleanupAll = exports.gitCloneBitbucketScript = exports.gitCloneGithubScript = exports.gitClone = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
const node_fs_1 = require("node:fs");
const errors_1 = require("./errors");
// Attempt to clean up if process exits for any reason
process.on("exit", () => {
    (0, exports.cleanupAll)();
});
const cleanupMap = {};
function execAsync(cmd, opts = {}) {
    return new Promise(function (resolve, reject) {
        // Execute the command, reject if we exit non-zero (i.e. error)
        shelljs_1.default.exec(cmd, opts, function (code, stdout, stderr) {
            if (code != 0)
                return reject(new Error(stderr));
            return resolve(stdout);
        });
    });
}
const gitClone = async (options) => {
    const { repoName, repoPath, hosting } = options;
    if (cleanupMap[repoName]) {
        throw new Error("Duplicate repoName");
    }
    const execScript = hosting === "github"
        ? (0, exports.gitCloneGithubScript)(options)
        : (0, exports.gitCloneBitbucketScript)(options);
    try {
        await execAsync(execScript);
        const cleanup = () => {
            cleanupMap[repoName] = null;
            delete cleanupMap[repoName];
            (0, node_fs_1.rmSync)(repoPath, { recursive: true, force: true });
        };
        cleanupMap[repoName] = cleanup;
        return cleanup;
    }
    catch (error) {
        const message = `${execScript}\n${(0, errors_1.getErrorMessage)(error)}`;
        throw new Error(message);
    }
};
exports.gitClone = gitClone;
const gitCloneGithubScript = (options) => {
    const { protocol, owner, repoName, repoPath, username, password, branch } = options;
    if (protocol === "ssh") {
        return `git clone --branch ${branch} git@github.com:${owner}/${repoName}.git ${repoPath}`;
    }
    else {
        return `git clone --branch ${branch} https://${getCloneCredentials(username, password)}github.com/${owner}/${repoName}.git ${repoPath}`;
    }
};
exports.gitCloneGithubScript = gitCloneGithubScript;
const gitCloneBitbucketScript = (options) => {
    const { protocol, owner, repoName, repoPath, username, password, branch } = options;
    if (protocol === "ssh") {
        return `git clone --branch ${branch} git@bitbucket.org:${owner}/${repoName}.git ${repoPath}`;
    }
    else {
        return `git clone --branch ${branch} https://${getCloneCredentials(username, password)}bitbucket.org/${owner}/${repoName}.git ${repoPath}`;
    }
};
exports.gitCloneBitbucketScript = gitCloneBitbucketScript;
const getCloneCredentials = (username, password) => {
    if (username && password) {
        return `${username}:${password}@`;
    }
    else if (username) {
        return `${username}@`;
    }
    else {
        return "";
    }
};
const cleanupAll = () => {
    Object.entries(cleanupMap).forEach(([repoName, cleanup]) => {
        cleanupMap[repoName] = null;
        delete cleanupMap[repoName];
        cleanup();
    });
};
exports.cleanupAll = cleanupAll;
const getLastCommitDate = async (repoPath) => {
    try {
        const stdout = await execAsync(`git log -1 --format=%cd --date=format:'%Y-%m-%d'`, {
            cwd: repoPath,
        });
        return stdout.trim();
    }
    catch (error) {
        (0, errors_1.storeError)(error.message);
        return Promise.resolve("");
    }
};
exports.getLastCommitDate = getLastCommitDate;

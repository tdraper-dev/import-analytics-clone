"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupAll = exports.gitCloneBitbucketScript = exports.gitCloneGithubScript = exports.gitClone = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
const node_fs_1 = require("node:fs");
// Attempt to clean up if process exits for any reason
process.on('exit', () => {
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
;
const gitClone = async (options) => {
    const { projectName, projectPath, hosting } = options;
    if (cleanupMap[projectName]) {
        throw new Error('Duplicate projectName');
    }
    const execScript = hosting === 'github' ? (0, exports.gitCloneGithubScript)(options) : (0, exports.gitCloneBitbucketScript)(options);
    await execAsync(execScript);
    const cleanup = () => {
        cleanupMap[projectName] = null;
        delete cleanupMap[projectName];
        (0, node_fs_1.rmSync)(projectPath, { recursive: true, force: true });
    };
    cleanupMap[projectName] = cleanup;
    return cleanup;
};
exports.gitClone = gitClone;
const gitCloneGithubScript = (options) => {
    const { protocol, author, projectName, projectPath, username } = options;
    if (protocol === 'ssh') {
        return `git clone git@github.com:${author}/${projectName}.git ${projectPath}`;
    }
    else {
        return `git clone https://${username}@github.com/${author}/${projectName}.git ${projectPath}`;
        // return `git clone https://github.com/${author}/${projectName}.git ${projectPath}`;
    }
};
exports.gitCloneGithubScript = gitCloneGithubScript;
const gitCloneBitbucketScript = (options) => {
    const { protocol, author, projectName, projectPath, username } = options;
    if (protocol === 'ssh') {
        return `git clone git@bitbucket.org:${author}/${projectName}.git ${projectPath}`;
    }
    else {
        return `git clone https://${username}@bitbucket.org/${author}/${projectName}.git ${projectPath}`;
    }
};
exports.gitCloneBitbucketScript = gitCloneBitbucketScript;
const cleanupAll = () => {
    Object.entries(cleanupMap).forEach(([projectName, cleanup]) => {
        cleanupMap[projectName] = null;
        delete cleanupMap[projectName];
        cleanup();
    });
};
exports.cleanupAll = cleanupAll;

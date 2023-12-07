import shell from "shelljs";
import { rmSync } from "node:fs";
import { GitCloneOptions } from './types';
import { getErrorMessage } from "./errors";

// Attempt to clean up if process exits for any reason
process.on('exit', () => {
    cleanupAll();
});

const cleanupMap: Record<string, () => void> = {};

function execAsync(cmd: string, opts: shell.ExecOptions = {}) {
    return new Promise(function (resolve, reject) {
        // Execute the command, reject if we exit non-zero (i.e. error)
        shell.exec(cmd, opts, function (code, stdout, stderr) {
            if (code != 0) return reject(new Error(stderr));
            return resolve(stdout);
        });
    });
};

export const gitClone = async (options: GitCloneOptions): Promise<() => void> => {
    const { repoName, repoPath, hosting } = options;

    if (cleanupMap[repoName]) {
        throw new Error('Duplicate repoName');
    }

    const execScript = hosting === 'github' ? gitCloneGithubScript(options) : gitCloneBitbucketScript(options);

    try {
        await execAsync(execScript);

        const cleanup = () => {
            cleanupMap[repoName] = null;
            delete cleanupMap[repoName];
            rmSync(repoPath, { recursive: true, force: true })
        };
    
        cleanupMap[repoName] = cleanup;
        return cleanup;
    } catch (error) {
        const message = `${execScript}\n${getErrorMessage(error)}`;
        throw new Error(message);
    }
};

export const gitCloneGithubScript = (options: GitCloneOptions): string => {
    const {
        protocol, owner, repoName, repoPath, username, branch
    } = options; 

    if (protocol === 'ssh') {
        return `git clone --branch ${branch} git@github.com:${owner}/${repoName}.git ${repoPath}`;
    } else {
        return `git clone --branch ${branch} https://${username}@github.com/${owner}/${repoName}.git ${repoPath}`;
        // return `git clone https://github.com/${owner}/${repoName}.git ${repoPath}`;
    }
}

export const gitCloneBitbucketScript = (options: GitCloneOptions): string => {
    const {
        protocol, owner, repoName, repoPath, username, branch
    } = options;

    if (protocol === 'ssh') {
        return `git clone --branch ${branch} git@bitbucket.org:${owner}/${repoName}.git ${repoPath}`;
    } else {
        return `git clone --branch ${branch} https://${username}@bitbucket.org/${owner}/${repoName}.git ${repoPath}`;
        // return `git clone https://bitbucket.org/${owner}/${repoName}.git ${repoPath}`;
    }
}

export const cleanupAll = (): void => {
    Object.entries(cleanupMap).forEach(([repoName, cleanup]) => {
        cleanupMap[repoName] = null;
        delete cleanupMap[repoName];
        cleanup()
    })
};

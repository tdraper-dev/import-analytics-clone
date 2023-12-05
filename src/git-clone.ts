import shell from "shelljs";
import { rmSync } from "node:fs";

interface GitCloneOptions {
    hosting: 'bitbucket' | 'github';
    protocol: 'ssh' | 'https';
    projectName: string;
    projectPath: string;
    author: string;
    username: string;
    branchName: string;
}

// Attempt to clean up if process exits for any reason
process.on('exit', () => {
    cleanupAll();
});

const cleanupMap: Record<string, () => void> = {};

function execAsync(cmd, opts = {}) {
    return new Promise(function (resolve, reject) {
        // Execute the command, reject if we exit non-zero (i.e. error)
        shell.exec(cmd, opts, function (code, stdout, stderr) {
            if (code != 0) return reject(new Error(stderr));
            return resolve(stdout);
        });
    });
};

export const gitClone = async (options: GitCloneOptions): Promise<() => void> => {
    const { projectName, projectPath, hosting } = options;

    if (cleanupMap[projectName]) {
        throw new Error('Duplicate projectName');
    }

    const execScript = hosting === 'github' ? gitCloneGithubScript(options) : gitCloneBitbucketScript(options);

    await execAsync(execScript);

    const cleanup = () => {
        cleanupMap[projectName] = null;
        delete cleanupMap[projectName];
        rmSync(projectPath, { recursive: true, force: true })
    };

    cleanupMap[projectName] = cleanup;
    return cleanup;
};

export const gitCloneGithubScript = (options: GitCloneOptions): string => {
    const {
        protocol, author, projectName, projectPath, username, branchName
    } = options; 

    if (protocol === 'ssh') {
        return `git clone --branch ${branchName} git@github.com:${author}/${projectName}.git ${projectPath}`;
    } else {
        return `git clone --branch ${branchName} https://${username}@github.com/${author}/${projectName}.git ${projectPath}`;
        // return `git clone https://github.com/${author}/${projectName}.git ${projectPath}`;
    }
}

export const gitCloneBitbucketScript = (options: GitCloneOptions): string => {
    const {
        protocol, author, projectName, projectPath, username, branchName
    } = options;

    if (protocol === 'ssh') {
        return `git clone --branch ${branchName} git@bitbucket.org:${author}/${projectName}.git ${projectPath}`;
    } else {
        return `git clone --branch ${branchName} https://${username}@bitbucket.org/${author}/${projectName}.git ${projectPath}`;
        // return `git clone https://bitbucket.org/${author}/${projectName}.git ${projectPath}`;
    }
}

export const cleanupAll = (): void => {
    Object.entries(cleanupMap).forEach(([projectName, cleanup]) => {
        cleanupMap[projectName] = null;
        delete cleanupMap[projectName];
        cleanup()
    })
};

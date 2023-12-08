export interface GitOptions {
  username?: string;
  password?: string;
  owner: string;
  hosting: "github" | "bitbucket";
  protocol: "ssh" | "https";
  branch: string;
}

export interface GitCloneOptions extends GitOptions {
  repoName: string;
  repoPath: string;
}

export interface Repo {
  name: string;
  git?: Partial<GitOptions>;
}

export interface Input {
  library: {
    name: string;
    imports: string[];
  };
  dependencies?: string[];
  repos: Array<Repo>;
  git: GitOptions;
}

export interface Output {
  metadata: {
    date: string;
  };
  aggregates: {
    reposThatIncludeImports: string[];
    reposThatExcludesImports: string[];
    imports: {
      [importName: string]: {
        instanceCount: number;
        repoCount: number;
      };
    };
    dependencies: {
      [dependencyName: string]: {
        repoCount: number;
      };
    };
  };
  repos: {
    [repoName: string]: {
      dependencies: Record<string, boolean>;
      importsUsed: number;
      importsNotUsed: number;
      imports: Record<string, { count: number }>;
      lastCommitDate: string;
    };
  };
}

export interface GitOptions {
  username: string;
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
  imports: string[];
  library: string;
  repos: Array<Repo>;
  git: GitOptions;
}

export interface Output {
  metadata: {
    date: string;
    reposThatIncludeImports: string[];
    reposThatExcludesImports: string[];
  };
  repos: {
    [repoName: string]: {
      importsUsed: number;
      importsNotUsed: number;
      imports: Record<string, { count: number }>;
    };
  };
}

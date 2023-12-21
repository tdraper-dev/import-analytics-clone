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
  /**
   * The API endpoint to which the resultant data will be sent
   */
  api_path?: string;
  /**
   * Unique indentifier to tag outgoing records in database
   */
  api_key?: string;
  /**
   * Check repos for imports from library.
   */
  library: {
    /**
     * Name of library:
     *
     * ```ts
     * import { SomeImport } from 'name-of-library';
     * ```
     */
    name: string;
    /**
     * List of imports to check for.
     */
    imports: string[];
  };
  /**
   * Check repo for dependencies found in package.json (Optional).
   */
  dependencies?: string[];
  /**
   * List of repos to check against and git options for each repo.
   */
  repos: Repo[];
  /**
   * Default git options that apply to all repos. These options can be overridden.
   */
  git: GitOptions;
}

export interface Output {
  library: Input["library"]["name"];
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
      imports: Record<string, { instanceCount: number }>;
      lastCommitDate: string;
    };
  };
}

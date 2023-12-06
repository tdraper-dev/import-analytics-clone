export interface Input {
    imports: string[];
    library: string;
    repos: Array<{
        name: string;
        git?: {
            hosting?: "github" | "bitbucket";
            protocol?: "ssh" | "https";
            author?: string;
            branch?: string;
        };
    }>;
    git: {
        username: string;
        author: string;
        hosting: "github" | "bitbucket";
        protocol: "ssh" | "https";
        branch: string;
    };
}

export interface Output {
    metadata: {
        date: string;
        projectsThatIncludeImports: number;
        projectsThatExcludesImports: number;
    };
    projects: {
        [projectName: string]: {
            importsUsed: number;
            importsNotUsed: number;
            imports: Record<string, { count: number }>;
        };
    };
}

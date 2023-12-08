import { readFileSync } from "node:fs";
import { getFilePaths } from "./get-file-paths";
import { Input, Output, Repo } from "./types";

// source: https://regexr.com/7ooba
const MATCH_AS_KEYWORD_IMPORT = /(\S+?)\s+?as/;

// source: https://regexr.com/7oh1p
const getImportRegex = (importPath: string): RegExp => {
  // return new RegExp(`import\\s+{([\\s,\\S]+?)}\\s+from\\s+[',"]${importPath}[',"]`, 'g');
  return new RegExp(
    `import\\s+{([^}]+?)}\\s+from\\s+[',"]${importPath}[',"]`,
    "g",
  );
};

const findImports = (file: string, imports: string[], library: string) => {
  return (
    [...file.matchAll(getImportRegex(library))]
      // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll#:~:text=access%20capture%20groups
      // get first instance of matched group (all the import instances)
      .map((matches) => matches[1])
      // split on comma (,)
      .map((importInstances) =>
        importInstances
          .split(",")
          // remove white space
          .map((importInstance) => importInstance.trim())
          // Handle import instances that use `as` keywords
          .map((importInstance) => {
            // Check for `as` keyword
            const importUsingAsKeyword = importInstance.match(MATCH_AS_KEYWORD_IMPORT)?.[1];

            if (importUsingAsKeyword) {
              return importUsingAsKeyword;
            }
            
            return importInstance;
          })
          // grab only the imports we care about
          .filter((importInstance) => imports.includes(importInstance)),
      )
      // combine all matches into one array
      .flat()
      // remove empty "instances" (when import uses trailing comma)
      .filter((importInstance) => !!importInstance)
      
  );
  // // remove commented out instances
  // .filter(importInstance => !importInstance.startsWith('/'));
};

export async function getImports(
  repoPath: Repo["name"],
  library: Input["library"],
): Promise<Output["repos"][string]["imports"]> {
  const libraryFiles = await getFilePaths(
    repoPath,
    `/**/*.@(${["ts", "tsx"].join("|")})`,
  );

  return libraryFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .map((file) => findImports(file, library.imports, library.name))
    .flat()
    .reduce((acc, curr) => {
      if (!acc[curr]) acc[curr] = { count: 0 };
      acc[curr].count += 1;
      return acc;
    }, {});
}

// source: https://regexr.com/7oh1p
export const getImportRegex = (importPath: string): RegExp => {
  // return new RegExp(`import\\s+{([\\s,\\S]+?)}\\s+from\\s+[',"]${importPath}[',"]`, 'g');
  return new RegExp(
    `import\\s+{([^}]+?)}\\s+from\\s+[',"]${importPath}[',"]`,
    "g"
  );
};

export const getImports = (
  file: string,
  imports: string[],
  library: string
) => {
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
          // grab only the imports we care about
          .filter((importInstance) => imports.includes(importInstance))
      )
      // combine all matches into one array
      .flat()
      // remove empty "instances" (when import uses trailing comma)
      .filter((importInstance) => !!importInstance)
  );
  // // remove commented out instances
  // .filter(importInstance => !importInstance.startsWith('/'));
};

# import-analytics

## How to Run

Library expects a `input.json` files at root of this directory [[schema]](./src/types.ts#20):

````ts
export interface Input {
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
````

```bash
npm run dev # build and run
# or
npm run build && npm run start # build and run
```

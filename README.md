# import-analytics

## How to Run In Repository

- Within whichever repository workflow you want to leverage in order to count imports per library, add the following as a step:

  ```
  - name: A Test Component Import Count
    uses: tdraper-dev/import-analytics-clone@0.1.0
  ```

- Supports the following inputs:

  ```yml
  inputs:
    checkout:
      description: "Specifies if this action should checkout the code"
      required: false
      default: "true"
    library:
      description: "Name of library whose component instance we will count"
      required: false
    imports:
      description: "Names components whose instances we will count, please pass as a stringified array"
      required: false
    hosting:
      description: "Hosting service"
      required: false
      default: "github"
    protocol:
      description: "Security protocol for github access"
      required: false
      default: "https"
    branch:
      description: "Branch off of which to read import count"
      required: false
      default: "main"
    password_token:
      description: "Password for cloning into repo"
      required: true
    username:
      description: "Username for cloning into repo"
      required: false
      default: ${{ github.repository_owner }}
    api_path:
      description: "Endpoint to which output data will be sent, if provided"
      required: false
    api_key:
      description: "Unique indentifier to tag outgoing records in database"
      required: false
  ```

  - **Note:** If no configuration object is specified on the server for the requesting repository, than the user must pass a `library` and a stringified list of `imports` as inputs directly to the action.
  - **Note:** If no `API_PATH` and `API_KEY` specified, the action ends by ouputting the results within the workflow logs.
  - **Note:** For `password_token`, simply pass the `${{ secrets.GITHUB_TOKEN }}` that Github uniquely generates per workspace.

## How to Test Locally

- The library expects an `input.json` file at root of this directory [[schema]](./src/types.ts#20):

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

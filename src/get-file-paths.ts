import { join } from "node:path";
import { glob } from "glob";

export async function getFilePaths(
  repoPath: string,
  wildcard: string,
): Promise<string[]> {
  return await glob(join(repoPath, wildcard), {
    // Support Windows paths
    windowsPathsNoEscape: true,
    // Don't capture directories
    nodir: true,
    // Shouldn't be needed, but just in case
    ignore: ["**/node_modules/**"],
  });
}

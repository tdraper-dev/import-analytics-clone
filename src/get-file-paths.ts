import { join } from "node:path";
import { glob } from "glob";

export async function getFilePaths(
  repoPath: string,
  wildcard: string
): Promise<string[]> {
  return await glob(join(repoPath, wildcard), {
    windowsPathsNoEscape: true,
  });
}

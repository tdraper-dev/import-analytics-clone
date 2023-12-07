import { join, sep } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const tmpDir = tmpdir();

export const getTempDir = () => {
  // Temporary directory based on os
  return mkdtempSync(`${tmpDir}${sep}`);
  // Local directory (for debugging)
  // return join(__dirname, "../temp");
};

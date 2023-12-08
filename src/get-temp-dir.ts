import { join, sep } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const tmpDir = tmpdir();

export const getTempDir = () => {
  // Temporary directory based on os
  return mkdtempSync(`${tmpDir}${sep}`);

  // return getLocalTempDir();
};

// Local directory (for debugging)
export const getLocalTempDir = () => join(__dirname, "../temp");

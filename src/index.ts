import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getTempDir } from "./get-temp-dir";
import { getOutput } from "./get-output";
import { Input, Output } from "./types";
import { getErrors, writeErrorsJson } from "./errors";

main();

async function main() {
  const dir = getTempDir();

  if (!existsSync(__dirname + "/../input.json")) {
    throw new Error("input.json not found");
  }

  const input: Input = JSON.parse(
    readFileSync(__dirname + "/../input.json", "utf8")
  );

  const output: Output = await getOutput(dir, input);

  writeFileSync(__dirname + "/../output.json", JSON.stringify(output, null, 2));

  const errorCount = getErrors().length;
  const repoCount = Object.keys(input.repos).length;

  console.log(
    `Repos ${repoCount} Success ${repoCount - errorCount} Errors ${errorCount}`
  );

  writeErrorsJson();

  if (errorCount) {
    console.log("Open `errors.json` to view errors");
  }
}

function getInput() {}

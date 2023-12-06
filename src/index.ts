import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getTempDir } from "./get-temp-dir";
import { getOutput } from "./get-output";
import { Input, Output } from "./types";

main();

async function main() {
  const dir = getTempDir();

  if (!existsSync(__dirname + "/../input.json")) {
    throw new Error("input.json not found");
  }

  const input: Input = JSON.parse(readFileSync(__dirname + "/../input.json", "utf8"));

  const output: Output = await getOutput(dir, input);

  writeFileSync(__dirname + "/../output.json", JSON.stringify(output, null, 2));
}

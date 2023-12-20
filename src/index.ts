import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getTempDir } from "./get-temp-dir";
import { getOutput } from "./get-output";
import { Input, Output } from "./types";
import { getErrors, writeErrorsJson } from "./errors";
import axios from "axios";

main();

async function sendDataRequest(jsonData: Output, route: string) {
  try {
    const { data } = await axios.post(route, jsonData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("result", data);
  } catch (e) {
    console.log("An error occurred while submitting the output: ", e);
  }
}

async function main() {
  const dir = getTempDir();

  if (!existsSync(__dirname + "/../input.json")) {
    throw new Error("input.json not found");
  }

  const input: Input = JSON.parse(
    readFileSync(__dirname + "/../input.json", "utf8"),
  );

  const output: Output = await getOutput(dir, input);

  writeFileSync(__dirname + "/../output.json", JSON.stringify(output, null, 2));

  const errorCount = getErrors().length;
  const repoCount = Object.keys(input.repos).length;

  if (!errorCount && input.api_path) {
    await sendDataRequest(output, input.api_path);
  }
  console.log(
    `Repos ${repoCount} Success ${repoCount - errorCount} Errors ${errorCount}`,
  );

  writeErrorsJson();

  if (errorCount) {
    console.log("Open `errors.json` to view errors");
  }
}

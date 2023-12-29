import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getTempDir } from "./get-temp-dir";
import { getOutput } from "./get-output";
import { Config, Input, Output } from "./types";
import { getErrors, writeErrorsJson } from "./errors";
import axios from "axios";

main();

async function sendDataRequest(
  jsonData: Output,
  route: string,
  accessKey: string,
) {
  try {
    const { data } = await axios.post(route, jsonData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessKey,
      },
    });
    if (!data.sucess) throw new Error("Submission failed");
  } catch (e) {
    console.log("An error occurred while submitting the output: ", e);
  }
}

async function fetchConfigRequest(
  params: Record<"repoName" | "libraryName", string>,
  route: string,
  accessKey: string,
) {
  try {
    const url = new URL(route);
    for (const key in params) {
      if (params[key]) url.searchParams.set(key, params[key]);
    }
    const {
      data: { data },
    } = await axios.get<{ data: Config }>(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessKey,
      },
    });
    console.log("DATA RESULT FOR CONFIG ===> ", data);
    return data;
  } catch (e) {
    console.log("An error occurred while fetching the config: ", e);
  }
}

async function main() {
  const dir = getTempDir();
  console.log("state 1");
  if (!existsSync(__dirname + "/../input.json")) {
    throw new Error("input.json not found");
  }
  console.log("state 2");

  const input: Input = JSON.parse(
    readFileSync(__dirname + "/../input.json", "utf8"),
  );
  console.log("state 3");

  let config: Config | undefined;

  if (input.api_path && input.api_key) {
    console.log("state 4");

    config = await fetchConfigRequest(
      { libraryName: input.library.name, repoName: input.repos[0].name },
      input.api_path,
      input.api_key,
    );
    console.log("state 5");
    console.log("RETRIEVED CONFIG --> ", config);
  }

  console.log("FINAL CONFIG ---> ", config);
  const finalInput: Input = {
    ...input,
    library: {
      name: input.library.name || config.libraryName,
      imports: input.library.imports || config.imports,
    },
    dependencies: input.dependencies || config.dependencies,
  };

  const output: Output = await getOutput(dir, finalInput);
  console.log("state 6");
  writeFileSync(__dirname + "/../output.json", JSON.stringify(output, null, 2));

  const errorCount = getErrors().length;
  const repoCount = Object.keys(input.repos).length;

  if (!errorCount && input.api_path && input.api_key) {
    await sendDataRequest(output, input.api_path, input.api_key);
  }
  console.log(
    `Repos ${repoCount} Success ${repoCount - errorCount} Errors ${errorCount}`,
  );

  writeErrorsJson();

  if (errorCount) {
    console.log("Open `errors.json` to view errors");
  }
}

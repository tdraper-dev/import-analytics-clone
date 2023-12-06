import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getTempDir } from "./get-temp-dir";
import { getOutput } from "./get-output";

main();

async function main() {
  const dir = getTempDir();

  if (!existsSync(__dirname + "/../input.json")) {
    throw new Error("input.json not found");
  }

  const input: Input = JSON.parse(
    readFileSync(__dirname + "/../input.json", "utf8")
  );

  const output = await getOutput(dir, input);

  writeFileSync(__dirname + "/../output.json", JSON.stringify(output, null, 2));
}

export interface Input {
  imports: string[];
  library: string;
  repos: Array<{
    name: string;
    git?: {
      hosting?: "github" | "bitbucket";
      protocol?: "ssh" | "https";
      author?: string;
      branch?: string;
    };
  }>;
  git: {
    username: string;
    author: string;
    hosting: "github" | "bitbucket";
    protocol: "ssh" | "https";
    branch: string;
  };
}

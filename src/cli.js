#!/usr/bin/env node
import { processTestCases } from "./index.js";
import { generateTestConfig } from "./utils/test-config-generator.js";
import path from "path";

const args = process.argv.slice(2);
const command = args[0];

if (command === "generate-config") {
  const appDir = args[1] || "./src";
  generateTestConfig(appDir);
} else {
  const inputFile = args[0];
  const outputFormat = args[1] || "xlsx";
  const configFile = args[2] || "./testConfig.js";

  if (!inputFile) {
    console.error(
      "Usage: spec-by-example <input-file> [output-format] [config-file]"
    );
    process.exit(1);
  }

  (async () => {
    try {
      await processTestCases(inputFile, outputFormat, path.resolve(configFile));
      console.log(
        `Test cases processed and results written to ${path.basename(
          inputFile
        )}.${outputFormat}`
      );
    } catch (err) {
      console.error("Error processing test cases:", err.message);
    }
  })();
}

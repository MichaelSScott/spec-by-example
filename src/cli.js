#!/usr/bin/env node
import { processTestCases } from "./index.js";
import { generateTestConfig } from "./utils/test-config-generator.js";
import { scanAppFunctions } from "./utils/code-scanner.js";
import path from "path";

const args = process.argv.slice(2);
const command = args[0];

// Command: Generate test config from scanned functions
if (command === "generate-config") {
  const appDir = args[1] || "./src";
  generateTestConfig(appDir);
}

// Command: Scan code for functions and refactoring suggestions
else if (command === "scan-code") {
  const appDir = args[1] || "./src";
  const functions = scanAppFunctions(appDir);

  console.log("\n--- Discovered Functions ---");
  functions.forEach((func) => {
    console.log(
      `Function: ${func.name} (${func.params.join(", ")}) in ${func.file}`
    );
  });
}

// Default Command: Run tests from specifications
else {
  const inputFile = args[0];
  const outputFormat = args[1] || "xlsx";
  const configFile = args[2] || "./testConfig.js";

  if (!inputFile) {
    console.error(
      "Usage: spec-by-example <input-file> [output-format] [config-file]"
    );
    console.error("       spec-by-example generate-config <app-directory>");
    console.error("       spec-by-example scan-code <app-directory>");
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

#!/usr/bin/env node
import { processTestCases } from "./index.js";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname issue in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const inputFile = args[0];
const outputFormat = args[1] || "xlsx";

if (!inputFile) {
  console.error("Usage: spec-by-example <input-file> [output-format]");
  process.exit(1);
}

(async () => {
  try {
    await processTestCases(inputFile, outputFormat);
    console.log(
      `Test cases processed and results written to ${path.basename(
        inputFile
      )}.${outputFormat}`
    );
  } catch (err) {
    console.error("Error processing test cases:", err.message);
  }
})();

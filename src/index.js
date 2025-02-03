import { parseTestCases } from "./excel/parser.js";
import { mapTestCases } from "./runner/test-case-mapper.js";
import { runTests } from "./runner/test-runner.js";
import { writeResults } from "./excel/writer.js";
import { validateTestCases } from "./excel/validator.js";

export const processTestCases = async (
  inputFile,
  outputFormat = "xlsx",
  actionsOrConfig
) => {
  const actions =
    typeof actionsOrConfig === "string"
      ? (await import(actionsOrConfig)).actions
      : actionsOrConfig;

  const rawRows = await parseTestCases(inputFile);
  const testCases = mapTestCases(rawRows);

  // Validate the test cases before running
  const validationErrors = validateTestCases(testCases, actions);
  if (validationErrors.length > 0) {
    console.error("Validation Errors Found:");
    validationErrors.forEach((err) => console.error(`- ${err}`));
    process.exit(1); // Exit if critical errors are found
  }

  const results = runTests(testCases, actions);
  await writeResults(inputFile, outputFormat, results);

  return results;
};

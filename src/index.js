import { parseTestCases } from "./excel/parser.js";
import { mapTestCases } from "./runner/testCaseMapper.js";
import { runTests } from "./runner/testRunner.js";
import { writeResults } from "./excel/writer.js";

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
  const results = runTests(testCases, actions);
  await writeResults(inputFile, outputFormat, results);

  return results;
};

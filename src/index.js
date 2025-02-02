import { parseTestCases } from "./excel/parser.js";
import { mapTestCases } from "./runner/testCaseMapper.js";
import { runTests } from "./runner/testRunner.js";
import { writeResults } from "./excel/writer.js";

export const processTestCases = async (inputFile, outputFormat = "xlsx") => {
  const rawRows = await parseTestCases(inputFile);
  const testCases = mapTestCases(rawRows);
  const results = runTests(testCases);
  await writeResults(inputFile, outputFormat, results);
  return results;
};

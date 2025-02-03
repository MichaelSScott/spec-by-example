import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import xlsx from "xlsx";

/**
 * Generates a template test case file based on the functions in testConfig.js.
 *
 * @param {string} configFile - Path to the testConfig.js file.
 * @param {string} outputFormat - Desired output format (xlsx, csv, ods).
 */
export const generateTemplateTestCases = async (configFile, outputFormat) => {
  // Convert the Windows file path to a file:// URL
  const configFileURL = pathToFileURL(path.resolve(configFile)).href;

  // Dynamically import the testConfig.js using the file:// URL
  const { actions } = await import(configFileURL);

  const testCases = [];

  Object.keys(actions).forEach((actionName) => {
    const func = actions[actionName];
    const paramNames = getParamNames(func);

    testCases.push({
      Description: `Test case for ${actionName}`,
      InitialState: "{}", // Default initial state
      Action: actionName,
      Inputs: paramNames.length
        ? JSON.stringify(createInputPlaceholder(paramNames))
        : "",
      Expected: "{}",
      ExpectedError: "",
    });
  });

  const outputFilePath = `template-test-cases.${outputFormat}`;
  writeTemplateFile(outputFilePath, outputFormat, testCases);
  console.log(`Template test cases written to ${outputFilePath}`);
};

/**
 * Extracts parameter names from a function.
 *
 * @param {Function} func - The function to extract parameters from.
 * @returns {Array} List of parameter names.
 */
const getParamNames = (func) => {
  const fnStr = func.toString();
  const result = fnStr.match(/\(([^)]*)\)/);
  return result ? result[1].split(",").map((param) => param.trim()) : [];
};

/**
 * Creates a placeholder object for function parameters.
 *
 * @param {Array} paramNames - List of parameter names.
 * @returns {Object} Placeholder object with parameter names as keys.
 */
const createInputPlaceholder = (paramNames) => {
  const input = {};
  paramNames.forEach((param) => {
    input[param] = `<${param}>`; // Placeholder value
  });
  return input;
};

/**
 * Writes the generated test cases to the specified format.
 *
 * @param {string} filePath - The output file path.
 * @param {string} format - The file format (xlsx, csv, ods).
 * @param {Array} data - The test cases to write.
 */
const writeTemplateFile = (filePath, format, data) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Template Test Cases");

  if (format === "csv") {
    const csvData = xlsx.utils.sheet_to_csv(worksheet);
    fs.writeFileSync(filePath, csvData);
  } else {
    xlsx.writeFile(workbook, filePath);
  }
};

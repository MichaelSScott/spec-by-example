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
  const configFileURL = pathToFileURL(path.resolve(configFile)).href;
  console.log(`Generating template test cases from ${configFileURL}...`);

  let actions;
  try {
    actions = await flexibleImport(configFileURL);
  } catch (err) {
    console.error(`Failed to import testConfig.js: ${err.message}`);
    process.exit(1);
  }

  const testCases = [];

  for (const actionName of Object.keys(actions)) {
    const func = actions[actionName];

    if (typeof func !== "function") {
      console.warn(`Skipping ${actionName}: Not a valid function.`);
      continue;
    }

    // Check if the function is defined in a file that indirectly imports a provider
    const filePath = getFunctionFilePath(func);
    if (filePath && importsProvider(filePath)) {
      console.warn(
        `Skipping ${actionName}: Function depends on provider module.`
      );
      continue;
    }

    const paramNames = getParamNames(func);

    testCases.push({
      Description: `Test case for ${actionName}`,
      InitialState: "{}",
      Action: actionName,
      Inputs: paramNames.length
        ? JSON.stringify(createInputPlaceholder(paramNames))
        : "",
      Expected: "{}",
      ExpectedError: "",
    });
  }

  const outputFilePath = `template-test-cases.${outputFormat}`;
  writeTemplateFile(outputFilePath, outputFormat, testCases);
  console.log(`Template test cases written to ${outputFilePath}`);
};

/**
 * Flexible import to handle missing file extensions in ESM and CommonJS.
 */
const flexibleImport = async (modulePath) => {
  console.log(`Attempting to import module: ${modulePath}`);

  try {
    const module = await import(modulePath);
    console.log(`Successfully imported: ${modulePath}`);
    return module.actions;
  } catch (err) {
    console.error(`1. Failed to import ${modulePath}: ${err.message}`);

    if (err.message.includes("Unexpected token '<'")) {
      console.warn(
        `Skipping ${modulePath}: JSX or unexpected syntax detected.`
      );
      return { actions: {} }; // Skip the problematic module
    }

    if (err.code === "ERR_MODULE_NOT_FOUND" && !modulePath.endsWith(".js")) {
      console.warn(`Retrying import with '.js' extension: ${modulePath}.js`);
      try {
        const module = await import(`${modulePath}.js`);
        console.log(
          `Successfully imported with '.js' extension: ${modulePath}.js`
        );
        return module.actions;
      } catch (innerErr) {
        console.error(`2. Failed to import with '.js': ${innerErr.message}`);
        throw innerErr;
      }
    }

    throw err; // Rethrow for unexpected errors
  }
};

/**
 * Retrieves the file path of a given function if available.
 */
const getFunctionFilePath = (func) => {
  if (func && func.file) {
    return func.file;
  }
  return null;
};

/**
 * Detects if the given file imports from a known provider module.
 */
const importsProvider = (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");
  return code.includes("import {") && code.includes("ModelProvider");
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
    input[param] = `<${param}>`;
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

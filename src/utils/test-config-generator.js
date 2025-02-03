import fs from "fs";
import path from "path";
import { scanAppFunctions } from "./code-scanner.js";

/**
 * Generates a testConfig.js file based on discovered functions.
 *
 * @param {string} appDir - Directory containing the app's source code.
 * @param {string} outputDir - Directory where testConfig.js will be created.
 */
export const generateTestConfig = (appDir, outputDir = "./") => {
  const functions = scanAppFunctions(appDir); // Assume scanAppFunctions is already implemented

  // Correctly resolve relative paths
  const imports = functions
    .map((func) => {
      const relativePath =
        "./" + path.relative(outputDir, func.file).replace(/\\/g, "/");
      return `import { ${func.name} } from '${relativePath}';`;
    })
    .join("\n");

  const mappings = functions.map((func) => `    ${func.name},`).join("\n");

  const configContent = `
${imports}

export const actions = {
${mappings}
};
`;

  fs.writeFileSync(path.join(outputDir, "testConfig.js"), configContent.trim());
  console.log("testConfig.js generated successfully.");
};

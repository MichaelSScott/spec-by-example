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
  console.log("Running generateTestConfig...");
  const functions = scanAppFunctions(appDir);

  const skippedFunctions = [];

  // Filter out functions that are not explicitly exported
  const filteredFunctions = functions.filter((func) => {
    const code = fs.readFileSync(func.file, "utf8");

    // Check if the function is exported
    const isExported =
      code.includes(`export const ${func.name}`) ||
      code.includes(`export function ${func.name}`) ||
      code.includes(`export default ${func.name}`);

    if (!isExported) {
      console.warn(
        `Skipping function ${func.name}: Not explicitly exported from ${func.file}`
      );
      skippedFunctions.push(func.name);
      return false;
    }
    return true;
  });

  const imports = filteredFunctions.map((func) => {
    const relativePath =
      "./" + path.relative(outputDir, func.file).replace(/\\/g, "/");
    return `import { ${func.name} } from '${relativePath}';`;
  });

  const mappings = filteredFunctions
    .map((func) => `    ${func.name},`)
    .join("\n");

  const configContent = `
${imports.join("\n")}

export const actions = {
${mappings}
};
`;

  fs.writeFileSync(path.join(outputDir, "testConfig.js"), configContent.trim());
  console.log("testConfig.js generated successfully.");

  // Provide feedback on skipped functions
  if (skippedFunctions.length > 0) {
    console.log("\n⚠️ Skipped Functions:");
    skippedFunctions.forEach((func) => {
      console.log(`- ${func} (not exported, or passed as a prop/component)`);
    });
  }
};

import fs from "fs/promises"; // Use the promises API for asynchronous operations
import path from "path";
import { scanAppFunctions } from "./code-scanner.js";
import winston from "winston"; // Logging library

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

/**
 * Generates a testConfig.js file based on discovered functions.
 *
 * @param {string} appDir - Directory containing the app's source code.
 * @param {string} outputDir - Directory where testConfig.js will be created.
 */
export const generateTestConfig = async (appDir, outputDir = "./") => {
  logger.info("Running generateTestConfig...");
  const functions = await scanAppFunctions(appDir);

  const skippedFunctions = [];

  // Filter out functions that are not explicitly exported
  const filteredFunctions = await Promise.all(
    functions.map(async (func) => {
      try {
        const code = await fs.readFile(func.file, "utf8");

        // Check if the function is exported
        const isExported = new RegExp(
          `export (const|function|default) ${func.name}`
        ).test(code);

        if (!isExported) {
          logger.warn(
            `Skipping function ${func.name}: Not explicitly exported from ${func.file}`
          );
          skippedFunctions.push(func.name);
          return null;
        }
        return func;
      } catch (error) {
        logger.error(`Error reading file ${func.file}: ${error.message}`);
        return null;
      }
    })
  );

  const validFunctions = filteredFunctions.filter(Boolean);

  const imports = validFunctions.map((func) => {
    const relativePath =
      "./" + path.relative(outputDir, func.file).replace(/\\/g, "/");
    return `import { ${func.name} } from '${relativePath}';`;
  });

  const mappings = validFunctions.map((func) => `    ${func.name},`).join("\n");

  const configContent = `
${imports.join("\n")}

export const actions = {
${mappings}
};
`;

  try {
    await fs.writeFile(
      path.join(outputDir, "testConfig.js"),
      configContent.trim()
    );
    logger.info("testConfig.js generated successfully.");
  } catch (error) {
    logger.error(`Error writing file testConfig.js: ${error.message}`);
  }

  // Provide feedback on skipped functions
  if (skippedFunctions.length > 0) {
    logger.info("\n⚠️ Skipped Functions:");
    skippedFunctions.forEach((func) => {
      logger.info(`- ${func} (not exported, or passed as a prop/component)`);
    });
  }
};

import fs from "fs";
import path from "path";
import { scanAppFunctions } from "./code-scanner.js";
import { parse } from "@babel/parser";

/**
 * Generates a testConfig.js file based on discovered functions.
 *
 * @param {string} appDir - Directory containing the app's source code.
 * @param {string} outputDir - Directory where testConfig.js will be created.
 */
export const generateTestConfig = (appDir, outputDir = "./") => {
  const functions = scanAppFunctions(appDir);
  const imports = [];

  functions.forEach((func) => {
    const filePath = path.resolve(func.file);
    const code = fs.readFileSync(filePath, "utf8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });

    let containsJSX = false;

    // Check if the file contains JSX
    ast.program.body.forEach((node) => {
      if (
        node.type === "ExpressionStatement" &&
        node.expression.type === "JSXElement"
      ) {
        containsJSX = true;
      }
    });

    // Skip files containing JSX
    if (!containsJSX) {
      const relativePath =
        "./" + path.relative(outputDir, func.file).replace(/\\/g, "/");
      imports.push(`import { ${func.name} } from '${relativePath}';`);
    }
  });

  const mappings = functions.map((func) => `    ${func.name},`).join("\n");

  const configContent = `
${imports.join("\n")}

export const actions = {
${mappings}
};
`;

  fs.writeFileSync(path.join(outputDir, "testConfig.js"), configContent.trim());
  console.log("testConfig.js generated successfully.");
};

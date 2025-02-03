import fs from "fs";
import path from "path";
import { scanAppFunctions } from "./code-scanner.js";

export const generateTestConfig = (appDir, outputDir = "./") => {
  const functions = scanAppFunctions(appDir);

  const imports = functions
    .map(
      (func) =>
        `import { ${func.name} } from '${path
          .relative(outputDir, func.file)
          .replace(/\\/g, "/")}';`
    )
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

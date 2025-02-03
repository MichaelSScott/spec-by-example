import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import babel traverse in CommonJS style
const traverse = require("@babel/traverse").default;

/**
 * Recursively get all JS files in a directory
 */
const getAllJsFiles = (dir, files = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      getAllJsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  });

  return files;
};

/**
 * Scan app code for functions and provide refactoring suggestions
 */
export const scanAppFunctions = (dir) => {
  const jsFiles = getAllJsFiles(dir);
  const functions = [];

  jsFiles.forEach((file) => {
    const code = fs.readFileSync(file, "utf8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      comments: true,
    });

    traverse(ast, {
      // Detect standard function declarations
      FunctionDeclaration({ node }) {
        const functionName = node.id.name;
        const paramCount = node.params.length;
        const hasDocs =
          node.leadingComments &&
          node.leadingComments.some(
            (comment) => comment.type === "CommentBlock"
          );

        if (paramCount > 3) {
          console.warn(
            `Refactor suggestion: Function "${functionName}" has too many parameters (${paramCount}). Consider simplifying.`
          );
        }

        if (!hasDocs) {
          console.warn(
            `Refactor suggestion: Function "${functionName}" lacks documentation.`
          );
        }

        functions.push({
          name: functionName,
          params: node.params.map((param) => param.name),
          file,
        });
      },

      // Detect arrow functions or function expressions assigned to variables
      VariableDeclarator({ node }) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          functions.push({
            name: node.id.name,
            params: node.init.params.map((param) => param.name),
            file,
          });
        }
      },
    });
  });

  return functions;
};

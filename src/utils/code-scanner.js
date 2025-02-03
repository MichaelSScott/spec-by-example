import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
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
 * Scan app code for functions and filter out React components.
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

    let isReactFile = false;

    // Detect if the file imports React
    traverse(ast, {
      ImportDeclaration({ node }) {
        if (node.source.value === "react") {
          isReactFile = true;
        }
      },
    });

    // Traverse the AST to find functions and skip React components
    traverse(ast, {
      FunctionDeclaration(path) {
        const functionName = path.node.id.name;
        const isPotentialReactComponent = /^[A-Z]/.test(functionName);
        let returnsJSX = false;

        // Check if the function returns JSX within its body
        path.traverse({
          ReturnStatement(returnPath) {
            const argument = returnPath.node.argument;
            if (
              argument &&
              (argument.type === "JSXElement" ||
                argument.type === "JSXFragment")
            ) {
              returnsJSX = true;
            }
          },
        });

        // Skip React components
        if (isReactFile && isPotentialReactComponent && returnsJSX) {
          return;
        }

        // Add non-React functions
        functions.push({
          name: functionName,
          params: path.node.params.map((param) => param.name),
          file,
        });
      },

      VariableDeclarator(path) {
        const { node } = path;
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          const functionName = node.id.name;
          const isPotentialReactComponent = /^[A-Z]/.test(functionName);
          let returnsJSX = false;

          // Check if the arrow function returns JSX
          path.traverse({
            ReturnStatement(returnPath) {
              const argument = returnPath.node.argument;
              if (
                argument &&
                (argument.type === "JSXElement" ||
                  argument.type === "JSXFragment")
              ) {
                returnsJSX = true;
              }
            },
          });

          // Skip React components
          if (isReactFile && isPotentialReactComponent && returnsJSX) {
            return;
          }

          // Add non-React functions
          functions.push({
            name: functionName,
            params: node.init.params.map((param) => param.name),
            file,
          });
        }
      },
    });
  });

  return functions;
};

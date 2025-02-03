import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse/lib/index.js";

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

    // Detect if the file is a React component file by checking for React imports
    traverse(ast, {
      ImportDeclaration({ node }) {
        if (node.source.value === "react") {
          isReactFile = true;
        }
      },
    });

    traverse(ast, {
      FunctionDeclaration({ node }) {
        const functionName = node.id.name;

        // Check if the function is a React component (capitalized and returns JSX)
        const isPotentialReactComponent = /^[A-Z]/.test(functionName);

        // Check if the function returns JSX
        let returnsJSX = false;
        traverse(node, {
          ReturnStatement({ node }) {
            if (
              node.argument &&
              (node.argument.type === "JSXElement" ||
                node.argument.type === "JSXFragment")
            ) {
              returnsJSX = true;
            }
          },
        });

        // Skip React components but keep non-React capitalized functions
        if (isReactFile && isPotentialReactComponent && returnsJSX) {
          return;
        }

        // Add the function if it's not a React component
        functions.push({
          name: functionName,
          params: node.params.map((param) => param.name),
          file,
        });
      },

      // Detect arrow functions assigned to variables
      VariableDeclarator({ node }) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          const functionName = node.id.name;

          // Same React detection logic for arrow functions
          const isPotentialReactComponent = /^[A-Z]/.test(functionName);

          let returnsJSX = false;
          traverse(node.init, {
            ReturnStatement({ node }) {
              if (
                node.argument &&
                (node.argument.type === "JSXElement" ||
                  node.argument.type === "JSXFragment")
              ) {
                returnsJSX = true;
              }
            },
          });

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

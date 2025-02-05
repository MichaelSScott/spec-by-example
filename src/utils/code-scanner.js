import fs from "fs/promises";
import path from "path";
import { parse } from "@babel/parser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;

const JS_EXTENSION = ".js";

// Recursively get all JS files in a directory
const getAllJsFiles = async (dir, files = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await getAllJsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(JS_EXTENSION)) {
      files.push(fullPath);
    }
  }

  return files;
};

// Scan app code for functions, skipping files containing JSX or exporting React components.
export const scanAppFunctions = async (dir) => {
  console.log(`Starting scan in directory: ${dir}`);
  const jsFiles = await getAllJsFiles(dir);
  const functions = [];

  for (const file of jsFiles) {
    const code = await fs.readFile(file, "utf8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });

    let containsJSX = false;
    let exportsReactComponent = false;

    // Single traversal to detect JSX and React component exports
    traverse(ast, {
      JSXElement() {
        containsJSX = true;
      },
      JSXFragment() {
        containsJSX = true;
      },
      ExportNamedDeclaration({ node }) {
        if (
          node.declaration &&
          node.declaration.type === "FunctionDeclaration"
        ) {
          const functionName = node.declaration.id.name;
          if (/^[A-Z]/.test(functionName)) {
            let returnsJSX = false;
            traverse(node, {
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
            if (returnsJSX) {
              exportsReactComponent = true;
            }
          }
        }
      },
    });

    if (containsJSX || exportsReactComponent) {
      console.log(`Skipping UI file: ${file}`);
      continue; // Skip files with JSX or exporting React components
    }

    // Proceed to scan for functions if no JSX or React components
    traverse(ast, {
      FunctionDeclaration({ node }) {
        const functionName = node.id.name;
        console.log(`Found function: ${functionName} in ${file}`);

        functions.push({
          name: functionName,
          params: node.params.map((param) => param.name),
          file,
        });
      },
      VariableDeclarator({ node }) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          const functionName = node.id.name;
          console.log(`Found function: ${functionName} in ${file}`);

          functions.push({
            name: functionName,
            params: node.init.params.map((param) => param.name),
            file,
          });
        }
      },
    });
  }

  if (functions.length === 0) {
    console.log("No functions found after scanning.");
  } else {
    console.log(`Total functions found: ${functions.length}`);
  }

  return functions;
};

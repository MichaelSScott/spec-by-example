# Specification by Example (SbE) Test Automation Tool

A flexible, app-agnostic JavaScript tool for running **Specification by Example (SbE)** tests from Excel, CSV, and ODS files. Designed to simplify the testing process for both technical and non-technical users, the tool automates test execution based on human-readable specifications.

**Work-in-progress. This is more of a plan. Don't expect too much yet.**

## Features

- **Multi-format support**: Run tests from **Excel (.xlsx)**, **CSV (.csv)**, and **OpenDocument Spreadsheets (.ods)**.
- **App-agnostic testing**: Automatically scan your codebase to generate a test configuration for your app.
- **Dynamic test execution**: Test cases are automatically matched to your app’s functions and run with real data.
- **Refactoring suggestions**: Identify potential improvements in your code (e.g., functions with too many parameters, missing documentation).
- **Simple test case authoring**: Use Excel or CSV files to write specifications—no deep technical knowledge required.
- **Extensible**: Use the CLI or integrate programmatically in your own projects.

---

## Installation
### 1. Install via NPM

```bash
    npm install -g spec-by-example
```

Or add it to your project:

```bash
    npm install spec-by-example
```

## Usage

### CLI Usage

Run the tool directly from your terminal to execute tests or generate test configurations.

1. **Run Tests from Specifications**

    ```bash 
    spec-by-example <input-file> [output-format] [config-file]
    ```

    - `<input-file>`: Path to the Excel/CSV/ODS file containing your test cases.
    - `[output-format]`: Format for test results (xlsx, csv, ods). Default: xlsx.
    - `[config-file]`: Path to a JavaScript configuration file mapping test actions to your app functions. Default: `./testConfig.js`.

    **Example:**

    ```bash
    spec-by-example tests/testCases.xlsx csv ./testConfig.js
    ```

    This will:

    1. Read testCases.xlsx.
    2. Run the tests against the functions specified in testConfig.js.
    3. Output results to testCases.csv.

2. **Generate Test Config Automatically**

    Automatically scan your app’s codebase to generate a testConfig.js file.

    ```bash
    spec-by-example generate-config <app-directory>
    ```

    -   `<app-directory>`: Path to the directory containing your app’s JavaScript code.

    **Example:**

    ```bash
    spec-by-example generate-config ./src
    ```

    This will:

    1. Scan ./src for functions.
    2. Generate a testConfig.js file that maps discovered functions for testing.
    3. Provide refactoring suggestions in the terminal if code structure issues are found.

3. **Scan Code for Refactoring Suggestions**

    Scans your app code to find functions and suggest refactoring opportunities:

    ```bash
    spec-by-example scan-code ./src
    ```

    - Output Example:

    ```
    Refactor suggestion: Function "complexFunction" has too many parameters (5). Consider simplifying.
    Refactor suggestion: Function "deleteEBE" lacks documentation.

    --- Discovered Functions ---
    Function: addEBE (model, ebe) in /path/to/src/appLogic.js
    Function: deleteEBE (model, ebeId) in /path/to/src/appLogic.js
    Function: complexFunction (a, b, c, d, e) in /path/to/src/appLogic.js
    ```

## Programmatic Usage

You can use the SbE tool directly in your JavaScript code.
1. Basic Programmatic Example

    ```javascript
    import { processTestCases } from 'spec-by-example';
    import { addEBE, addGenerator } from './src/appLogic.js'; // Your app logic

    const actions = { addEBE, addGenerator };

    processTestCases('./tests/testCases.xlsx', 'csv', actions).then(results => {
        console.log('Test Results:', results);
    });
    ```

2. Using an External Config File

    ```javascript
    import { processTestCases } from 'spec-by-example';

    processTestCases('./tests/testCases.xlsx', 'csv', './testConfig.js').then(results => {
        console.log('Test Results:', results);
    });
    ```

## Generating Test Config Automatically

The SbE tool can scan your app’s code to automatically generate the testConfig.js file that maps functions to test cases.
1. Example

    ```bash
    spec-by-example generate-config ./src
    ```

    This will:

    1. Identify all functions in the ./src directory.
    2. Generate a testConfig.js file like this:

    ```javascript
    import { addEBE } from './src/model/ebe.js';
    import { addGenerator } from './src/model/generator.js';

    export const actions = {
        addEBE,
        addGenerator
    };
    ```

    3. Output refactoring suggestions if code smells are detected.

## Writing Test Cases

You can write test cases in **Excel**, **CSV**, or **ODS** formats. The structure remains the same across formats.

**Excel/CSV Format**

| **Description**         | **InitialState**                       | **Action**      | **Inputs**                      | **Expected**                                   | **ExpectedError**                   |
|-------------------------|----------------------------------------|-----------------|---------------------------------|------------------------------------------------|-------------------------------------|
| Add valid EBE           | `{"EBEs":[]}`                         | `addEBE`        | `{"id":1,"name":"Manager"}`     | `{"EBEs":[{"id":1,"name":"Manager"}]}`         |                                     |
| Reject EBE without name | `{"EBEs":[]}`                         | `addEBE`        | `{"id":2}`                      |                                                | `EBE must have an id and a name.`   |
| Add AND Generator       | `{"Generators":[]}`                   | `addGenerator`  | `{"id":101,"type":"AND"}`       | `{"Generators":[{"id":101,"type":"AND"}]}`     |                                     |


**Field Descriptions:**

- **Description**: Human-readable description of the test case.
- **InitialState**: JSON object representing the state before the action.
- **Action**: Name of the function to test (should match a function in your app).
- **Inputs**: JSON object (or simple value) representing the input parameters.
- **Expected**: The expected result after the action is performed.
- **ExpectedError**: (Optional) Expected error message if the test should throw an error.

## Refactoring Suggestions

The SbE tool will provide refactoring suggestions when scanning your codebase. This helps keep your codebase clean and maintainable while focusing on improving testing workflows.

**Example Suggestions:**

- Functions with Too Many Parameters:
    - "Function addEBE has 5 parameters. Consider simplifying or breaking it down."

- Missing Documentation:
    - "Function addGenerator lacks documentation. Consider adding JSDoc comments."

- Redundant Test Cases:
    - "Test cases for addEBE are producing identical outputs. Consider consolidating similar tests."

## Examples
1. Run Tests from Excel

    ```bash 
    spec-by-example tests/testCases.xlsx
    ```

2. Run Tests and Output to CSV

    ```bash 
    spec-by-example tests/testCases.xlsx csv
    ```

3. Run Tests with Custom Config

    ```bash 
    spec-by-example tests/testCases.xlsx ods ./customTestConfig.js
    ```

4. Generate Config Automatically

    ```bash 
    spec-by-example generate-config ./src
    ```

## Contributing

We welcome contributions! Feel free to fork the repository, open issues, and submit pull requests.

## License

This project is licensed under the MIT License.
/**
 * Validates the structure and content of the test cases.
 *
 * @param {Array} testCases - The array of test cases from Excel/CSV/ODS.
 * @param {Object} actions - The mapping of available functions for testing.
 * @returns {Array} Array of validation errors (if any).
 */
export const validateTestCases = (testCases, actions) => {
  const errors = [];

  testCases.forEach((testCase, index) => {
    const line = index + 2; // Line number (considering headers start from line 1)

    // Check for required fields
    if (!testCase.Description) {
      errors.push(`Line ${line}: Missing "Description" field.`);
    }
    if (!testCase.Action) {
      errors.push(`Line ${line}: Missing "Action" field.`);
    }
    if (!testCase.Expected && !testCase.ExpectedError) {
      errors.push(
        `Line ${line}: Either "Expected" or "ExpectedError" must be provided.`
      );
    }
    if (testCase.Expected && testCase.ExpectedError) {
      errors.push(
        `Line ${line}: Test case cannot have both "Expected" and "ExpectedError".`
      );
    }

    // Validate JSON fields (InitialState, Inputs, Expected)
    ["InitialState", "Inputs", "Expected"].forEach((field) => {
      if (testCase[field]) {
        try {
          JSON.parse(testCase[field]);
        } catch (err) {
          errors.push(`Line ${line}: Invalid JSON in "${field}" field.`);
        }
      }
    });

    // Validate ExpectedError (if present)
    if (testCase.ExpectedError && typeof testCase.ExpectedError !== "string") {
      errors.push(`Line ${line}: "ExpectedError" must be a string.`);
    }

    // Verify that the action exists in the provided functions
    if (testCase.Action && !actions[testCase.Action]) {
      errors.push(`Line ${line}: Unknown action "${testCase.Action}".`);
    }
  });

  return errors;
};

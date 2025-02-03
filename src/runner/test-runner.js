export const runTests = (testCases, domainFunctions = {}) => {
  return testCases.map((testCase) => {
    const {
      description,
      initialState,
      action,
      inputs,
      expected,
      expectedError,
    } = testCase;
    const actionFn = domainFunctions[action];

    if (!actionFn) {
      return { description, pass: false, error: `Unknown action: ${action}` };
    }

    try {
      const result = actionFn(initialState, inputs);
      if (expectedError) {
        return {
          description,
          pass: false,
          error: "Expected an error but got success",
        };
      }
      return {
        description,
        pass: JSON.stringify(result) === JSON.stringify(expected),
      };
    } catch (error) {
      return {
        description,
        pass: expectedError && error.message === expectedError,
        error: error.message,
      };
    }
  });
};

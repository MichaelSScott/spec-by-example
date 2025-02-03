export const mapTestCases = (rows) => {
  return rows.map((row, index) => ({
    description: row.Description || `Test case ${index + 1}`,
    initialState: row.InitialState ? JSON.parse(row.InitialState) : null,
    action: row.Action,
    inputs: row.Inputs ? JSON.parse(row.Inputs) : null,
    expected: row.Expected ? JSON.parse(row.Expected) : null,
    expectedError: row.ExpectedError || null,
  }));
};

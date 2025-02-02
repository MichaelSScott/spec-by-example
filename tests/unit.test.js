import { mapTestCases } from "../src/runner/testCaseMapper.js";

test("should map rows to test cases correctly", () => {
  const rows = [
    {
      Description: "Add item to order",
      InitialState: '{"id":1,"status":"open","items":[]}',
      Action: "addItemToOrder",
      Inputs: '"apple"',
      Expected: '{"id":1,"status":"open","items":["apple"]}',
    },
  ];

  const testCases = mapTestCases(rows);

  expect(testCases[0].description).toBe("Add item to order");
  expect(testCases[0].initialState).toEqual({
    id: 1,
    status: "open",
    items: [],
  });
  expect(testCases[0].inputs).toBe("apple");
  expect(testCases[0].expected).toEqual({
    id: 1,
    status: "open",
    items: ["apple"],
  });
});

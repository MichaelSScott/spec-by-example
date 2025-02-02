import { mapTestCases } from "../src/runner/testCaseMapper.js";

test("should map Excel rows to test cases correctly", () => {
  const rows = [
    {
      Description: "Add item",
      InitialState: '{"id":1}',
      Action: "addItemToOrder",
      Inputs: '"apple"',
      Expected: '{"id":1,"items":["apple"]}',
    },
  ];
  const testCases = mapTestCases(rows);

  expect(testCases[0].description).toBe("Add item");
  expect(testCases[0].initialState).toEqual({ id: 1 });
  expect(testCases[0].inputs).toBe("apple");
});

import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const PEOPLE1_CSV_PATH = path.join(__dirname, "../data/people1.csv");

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH);

  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH);
  for (const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

// tests for future extensibility
test("parseCSV handles empty fields or trailing commas", async () => {
  const result = await parseCSV(PEOPLE1_CSV_PATH);
  expect(result[1]).toEqual(["Prince", "", ""]);
});

test("parseCSV removes enclosing qoutes", async () => {
  const result = await parseCSV(PEOPLE1_CSV_PATH);
  expect(result[4]).toEqual(["Prince Wilson", "28", "wils@gmail.com"]);
});

test("parseCSV handles commas in quotes", async () => {
  const result = await parseCSV(PEOPLE1_CSV_PATH);
  expect(result[2]).toEqual(["Prince,Wilson", "24", "wils@gmail.com"]);
});

test("parseCSV handles qoutes in qoutes", async () => {
  const result = await parseCSV(PEOPLE1_CSV_PATH);
  expect(result[5]).toEqual(['Prince is a good "boy"', "28", "wils@gmail.com"]);
});

// tests for improved parser with introduction of validation
describe("parseCSV with schema validation", () => {
  test("parseCSV works for shema with all fields as a string", async () => {
    const schema = z.tuple([z.string(), z.string()]);
    const result = await parseCSV(PEOPLE_CSV_PATH, schema);

    // all rows successfully matches schema definition
    for (const res of result) {
      expect(res.success).toBe(true);
    }

    if (result[1].success) {
      expect(result[3].data).toEqual(["Charlie", "25"]);
    }
    if (result[2].success) {
      expect(result[2].data).toEqual(["Bob", "thirty"]);
    }
  });

  test("parseCSV works with age as number", async () => {
    const schema = z.tuple([z.string(), z.coerce.number()]);
    const result = await parseCSV(PEOPLE_CSV_PATH, schema);

    expect(result[1].success).toBe(true);
    expect(result[2].success).toBe(false); // fails for thirty
    expect(result[3].success).toBe(true);
  });
});

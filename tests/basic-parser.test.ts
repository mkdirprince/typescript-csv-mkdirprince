import { parseCSV } from "../src/basic-parser";
import * as path from "path";

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

test("parseCSV handles multiline quoted fields", async () => {
  const result = await parseCSV(PEOPLE1_CSV_PATH);
  expect(result[result.length - 1]).toEqual([
    "Prince\nWilson",
    "28",
    "wils@gmail.com",
  ]);
});

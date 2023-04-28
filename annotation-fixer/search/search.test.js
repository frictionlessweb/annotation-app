import test from "ava";
import { searchForString, pageOfString } from "./search.js";

test("An empty search returns nothing", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t" },
  ];
  /** @type [] */
  const expected = [];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("", input);
  t.deepEqual(actual, expected);
});

test("We can find characters in a search", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t" },
  ];
  const expected = [input];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("test", input);
  t.deepEqual(actual, expected);
});

test("We can find the page number in a search", (t) => {
  const input = [
    { letter: "t", page: 1 },
    { letter: "e", page: 1 },
    { letter: "s", page: 1 },
    { letter: "t", page: 1 },
  ];
  const expected = 1;
  // @ts-expect-error - We only need the letter property to search.
  const actual = pageOfString("test", input);
  t.deepEqual(actual, expected);
});

test("We do not find the characters if they aren't in the array", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: " " },
    { letter: "s" },
    { letter: "t" },
  ];
  /** @type [] */
  const expected = [];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("test", input);
  t.deepEqual(actual, expected);
});

test("We can find the output in a larger array", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: " " },
    { letter: "t" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "3" },
    { letter: "t", id: "3" },
  ];
  const expected = [
    [
      { letter: "t" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "3" },
    ],
  ];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("test", input);
  t.deepEqual(actual, expected);
});

test("We can find the output multiple times", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: " " },
    { letter: "t" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "3" },
    { letter: "t", id: "4" },
    { letter: "t", id: "5" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "6" },
  ];
  const expected = [
    [
      { letter: "t" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "3" },
    ],
    [
      { letter: "t", id: "5" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "6" },
    ],
  ];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("test", input);
  t.deepEqual(actual, expected);
});

test("We can find the output three times", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: " " },
    { letter: "t" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "3" },
    { letter: "t", id: "4" },
    { letter: "t", id: "5" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "6" },
    { letter: " ", id: "7" },
    { letter: " ", id: "8" },
    { letter: "t", id: "9" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "10" },
    { letter: " ", id: "10" },
  ];
  const expected = [
    [
      { letter: "t" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "3" },
    ],
    [
      { letter: "t", id: "5" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "6" },
    ],
    [
      { letter: "t", id: "9" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "10" },
    ],
  ];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("test", input);
  t.deepEqual(actual, expected);
});

test("We can find the output four times", (t) => {
  const input = [
    { letter: "t" },
    { letter: "e" },
    { letter: " " },
    { letter: "t" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "3" },
    { letter: "t", id: "4" },
    { letter: "t", id: "5" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "6" },
    { letter: " ", id: "7" },
    { letter: " ", id: "8" },
    { letter: "t", id: "9" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "10" },
    { letter: "t", id: "11" },
    { letter: "e" },
    { letter: "s" },
    { letter: "t", id: "12" },
  ];
  const expected = [
    [
      { letter: "t" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "3" },
    ],
    [
      { letter: "t", id: "5" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "6" },
    ],
    [
      { letter: "t", id: "9" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "10" },
    ],
    [
      { letter: "t", id: "11" },
      { letter: "e" },
      { letter: "s" },
      { letter: "t", id: "12" },
    ],
  ];
  // @ts-expect-error - We only need the letter property to search.
  const actual = searchForString("test", input);
  t.deepEqual(actual, expected);
});

import test from "ava";
import {
  analyzeElements,
  fourNumbersToBounds,
  groupCharactersIntoWordGroups,
  quadpointsToBoundingBoxes,
} from "./api.js";
import fs from "fs";
import path from "path";

import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

test("analyzeElements is a function", (t) => {
  t.deepEqual(typeof analyzeElements, "function");
});

test("fourNumbersToBounds is a function", (t) => {
  t.deepEqual(typeof fourNumbersToBounds, "function");
});

test("fourNumbersToBounds works on a simple example", (t) => {
  t.deepEqual(
    fourNumbersToBounds(
      [
        77.09342956542969, 711.0675964355469, 537.0668182373047,
        763.4272308349609,
      ],
      {
        height: 792,
        width: 612,
        page_number: 0,
      }
    ),
    {
      // eslint-disable-next-line
      top: 28.572769165039062,
      left: 77.09342956542969,
      width: 459.973388671875,
      height: 52.35963439941406,
    }
  );
});

test("Grouping characters into word groups works on one example", (t) => {
  const input = [
    {
      letter: "T",
    },
    {
      letter: "h",
    },
    {
      letter: "i",
    },
    {
      letter: "s",
    },
    {
      letter: " ",
    },
    {
      letter: "i",
    },
    {
      letter: "s",
    },
    {
      letter: " ",
    },
    {
      letter: " ",
    },
    {
      letter: " ",
    },
    {
      letter: "a",
    },
    {
      letter: " ",
    },
    {
      letter: "t",
    },
    {
      letter: "e",
    },
    {
      letter: "s",
    },
    {
      letter: "t",
    },
    {
      letter: " ",
    },
  ];
  const expected = [
    [{ letter: "T" }, { letter: "h" }, { letter: "i" }, { letter: "s" }],
    [{ letter: "i" }, { letter: "s" }],
    [{ letter: "a" }],
    [{ letter: "t" }, { letter: "e" }, { letter: "s" }, { letter: "t" }],
  ];
  // @ts-expect-error - For the purposes of this test, it's OK that the
  // inputs to this function aren't actually Characters.
  const actual = groupCharactersIntoWordGroups(input);
  t.deepEqual(actual, expected);
});

test("Grouping characters into words works on another example", (t) => {
  const input = [
    {
      letter: "T",
    },
    {
      letter: "h",
    },
    {
      letter: "i",
    },
    {
      letter: "s",
    },
    {
      letter: " ",
    },
    {
      letter: "i",
    },
    {
      letter: "s",
    },
    {
      letter: " ",
    },
    {
      letter: " ",
    },
    {
      letter: " ",
    },
    {
      letter: "a",
    },
    {
      letter: " ",
    },
    {
      letter: "t",
    },
    {
      letter: "e",
    },
    {
      letter: "s",
    },
    {
      letter: "t",
    },
    {
      letter: " ",
    },
    {
      letter: "a",
    },
  ];
  const expected = [
    [{ letter: "T" }, { letter: "h" }, { letter: "i" }, { letter: "s" }],
    [{ letter: "i" }, { letter: "s" }],
    [{ letter: "a" }],
    [{ letter: "t" }, { letter: "e" }, { letter: "s" }, { letter: "t" }],
    [{ letter: "a" }],
  ];
  // @ts-expect-error - For the purposes of this test, it's OK that the
  // inputs to this function aren't actually Characters.
  const actual = groupCharactersIntoWordGroups(input);
  t.deepEqual(actual, expected);
});

test("quadpointsToBoundingBoxes returns an empty array for an empty input array", (t) => {
  const input = [];
  const expectedOutput = [];
  const actualOutput = quadpointsToBoundingBoxes(input);
  t.deepEqual(actualOutput, expectedOutput);
});

test("quadpointsToBoundingBoxes correctly converts a single set of quadpoints into a bounding box", (t) => {
  const input = [10, 20, 30, 20, 30, 40, 10, 40];
  const expectedOutput = [[10, 20, 30, 40]];
  const actualOutput = quadpointsToBoundingBoxes(input);
  t.deepEqual(actualOutput, expectedOutput);
});

test("quadpointsToBoundingBoxes correctly converts multiple sets of quadpoints into bounding boxes", (t) => {
  const input = [
    10, 20, 30, 20, 30, 40, 10, 40, 50, 60, 70, 60, 70, 80, 50, 80,
  ];
  const expectedOutput = [
    [10, 20, 30, 40],
    [50, 60, 70, 80],
  ];
  const actualOutput = quadpointsToBoundingBoxes(input);
  t.deepEqual(actualOutput, expectedOutput);
});

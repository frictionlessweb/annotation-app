import test from "ava";
import { areOverlapping, serializeBounds, boxContaining } from "./math.js";

test("areOverlapping is a function", (t) => {
  t.deepEqual(typeof areOverlapping, "function");
});

test("areOverlapping works when the bounds overlap", (t) => {
  const overlap = areOverlapping(
    { top: 0, left: 0, width: 10, height: 10 },
    { top: 0, left: 0, width: 5, height: 5 }
  );
  t.deepEqual(overlap, true);
});

test("areOverlapping works when the bounds do not overlap", (t) => {
  const overlap = areOverlapping(
    { top: 0, left: 0, width: 10, height: 10 },
    { top: 100, left: 100, width: 5, height: 5 }
  );
  t.deepEqual(overlap, false);
});

test("serializeBounds is  a function", (t) => {
  t.deepEqual(typeof serializeBounds, "function");
});

test("serializeBounds works correctly on provided bounds", (t) => {
  t.deepEqual(
    serializeBounds({ top: 10, left: 20, width: 30, height: 40 }),
    "top10left20width30height40"
  );
});

test("boxContaining finds the largest box containing multiple boxes", (t) => {
  t.deepEqual(
    boxContaining([
      { top: 0, left: 0, width: 10, height: 10 },
      { top: 90, left: 90, width: 10, height: 10 },
    ]),
    { top: 0, left: 0, width: 100, height: 100 }
  );
});

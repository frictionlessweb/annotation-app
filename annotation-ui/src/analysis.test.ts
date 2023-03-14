import { areOverlapping, boxContaining, fourNumbersToBounds } from "./analysis";

test("areOverlapping works when the bounds overlap", () => {
  const overlap = areOverlapping(
    { top: 0, left: 0, width: 10, height: 10 },
    { top: 0, left: 0, width: 5, height: 5 }
  );
  expect(overlap).toBe(true);
});

test("areOverlapping works when the bounds do not overlap", () => {
  const overlap = areOverlapping(
    { top: 0, left: 0, width: 10, height: 10 },
    { top: 100, left: 100, width: 5, height: 5 }
  );
  expect(overlap).toBe(false);
});

test("boxContaining finds the largest box containing multiple boxes", () => {
  expect(
    boxContaining([
      { top: 0, left: 0, width: 10, height: 10 },
      { top: 90, left: 90, width: 10, height: 10 },
    ])
  ).toEqual({ top: 0, left: 0, width: 100, height: 100 });
});

test("fourNumbersToBounds works", () => {
  const actual = fourNumbersToBounds(
    [
      77.09342956542969, 711.0675964355469, 537.0668182373047,
      763.4272308349609,
    ],
    {
      height: 792,
      width: 612,
      page_number: 0,
    }
  );
  const expected = {
    // eslint-disable-next-line
    top: 28.572769165039062,
    left: 77.09342956542969,
    width: 459.973388671875,
    height: 52.35963439941406,
  };
  expect(actual).toEqual(expected);
});

/**
 * areOverlapping - Determine whether two bounding boxes in the DOM overlap
 * or not.
 *
 * @param {import("./math.js").Bounds} boxOne - The first set of bounding boxes.
 * @param {import("./math.js").Bounds} boxTwo - The second set of bounding boxes.
 * @returns {boolean}
 */
export const areOverlapping = (boxOne, boxTwo) => {
  const verticallySeparate =
    boxOne.top >= boxTwo.top + boxTwo.height ||
    boxTwo.top >= boxOne.top + boxOne.height;
  const horizontallySeparate =
    boxOne.left >= boxTwo.left + boxTwo.width ||
    boxTwo.left >= boxOne.left + boxOne.width;
  return !verticallySeparate && !horizontallySeparate;
};

/**
 * boxContaining - Find the largest box containing two other boxes.
 * See https://github.com/allenai/pawls/blob/3cc57533248e7ca787b71cafcca5fb66e96b2166/ui/src/context/PDFStore.ts#L31
 *
 * @param {import("./math.js").Bounds[]} bounds
 * @returns {import("./math.js").Bounds}
 */
export const boxContaining = (bounds) => {
  let left = Number.MAX_VALUE;
  let top = Number.MAX_VALUE;
  let right = 0;
  let bottom = 0;
  for (const token of bounds) {
    top = Math.min(token.top, top);
    left = Math.min(token.left, left);
    right = Math.max(token.left + token.width, right);
    bottom = Math.max(token.top + token.height, bottom);
  }
  const width = right - left;
  const height = bottom - top;
  return {
    top,
    left,
    width,
    height,
  };
};

/**
 * serializeBounds - Take a DOM bounds object and serialize it into a string.
 * This behavior is useful when tagging various objects with IDs that would
 * not otherwise have a natural ID.
 *
 * @param {import("./math.js").Bounds} bounds
 * @returns {string}
 */
export const serializeBounds = (bounds) => {
  return `top${bounds.top}left${bounds.left}width${bounds.width}height${bounds.height}`;
};

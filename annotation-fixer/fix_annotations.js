import {
  quadpointsToBoundingBoxes,
  analyzeElements,
  fourNumbersToBounds,
} from "./api/api.js";
import { areOverlapping } from "./math/math.js";
/**
 * addBodyTextToAnnotation - Attach body text to the annotation given the extract json.
 *
 * @param {import("./api/api").Highlight} annotation
 * @param {import("./api/api").ExtractResult} extractJson
 */
export const addBodyTextToAnnotation = (annotation, extractJson) => {
  const { quadPoints } = annotation.target.selector;
  const { index: page } = annotation.target.selector.node;
  const docContext = analyzeElements(extractJson);
  const highlightBoundingBoxes = quadpointsToBoundingBoxes(quadPoints);
  const boundsList = highlightBoundingBoxes.map((bbox) => {
    return fourNumbersToBounds(bbox, docContext.pages[page]);
  });
  const overlappingCharacters = boundsList.map((bounds) => {
    const relevantCharacters = docContext.characters
      .filter((char) => {
        return char.page === page && areOverlapping(char.bounds, bounds);
      })
      .map((char) => char.letter);
    return relevantCharacters.join("");
  });
  const bodyValue = overlappingCharacters.join("");
  const isEmptyBodyValue = bodyValue === "";
  if (isEmptyBodyValue) {
    throw new Error("EXPECTED BODY VALUE");
  }
  annotation.bodyValue = bodyValue;
};

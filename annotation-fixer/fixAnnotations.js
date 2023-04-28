import {
  quadpointsToBoundingBoxes,
  analyzeElements,
  fourNumbersToBounds,
} from "./api/api.js";
import { areOverlapping } from "./math/math.js";
import { walkHighlights } from './traverse.js';
import fs from "fs";

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

/**
 * jsonFileToObject - Take the path to a JSON file and turn it into a JavaScript
 * object.
 *
 * @param {string} jsonPath
 */
const jsonFileToObject = (jsonPath) => {
  const jsonString = fs.readFileSync(jsonPath, { encoding: "utf-8" });
  return JSON.parse(jsonString);
};

/**
 * fixAnnotations - Given bad highlights and a path to the extract API json
 * associated with those highlights, attach the body text to all of the
 * highlights.
 *
 * @param {string} highlightsPath
 * @param {string} extractPath
 * @param {string} resultPath
 */
export const fixAnnotations = (highlightsPath, extractPath, resultPath) => {
  const highlights = jsonFileToObject(highlightsPath);
  const extract = jsonFileToObject(extractPath);
  walkHighlights(highlights, (highlight) => {
    addBodyTextToAnnotation(highlight, extract);
  });
  fs.writeFileSync(resultPath, JSON.stringify(highlights), {
    encoding: "utf-8",
  });
};

import { serializeBounds } from "../math/math.js";

/**
 * quadpointsToBoundingBoxes - Takes a series of quadpoints and converts them
 * into bounding boxes.
 * @param {number[]} quadpoints
 * @returns {import("./api").ExtractBounds[]}
 */
export const quadpointsToBoundingBoxes = (quadpoints) => {
  const boxes = [];
  for (let i = 0; i < quadpoints.length; i += 8) {
    const x1 = Math.min(
      quadpoints[i],
      quadpoints[i + 2],
      quadpoints[i + 4],
      quadpoints[i + 6]
    );
    const y1 = Math.min(
      quadpoints[i + 1],
      quadpoints[i + 3],
      quadpoints[i + 5],
      quadpoints[i + 7]
    );
    const x2 = Math.max(
      quadpoints[i],
      quadpoints[i + 2],
      quadpoints[i + 4],
      quadpoints[i + 6]
    );
    const y2 = Math.max(
      quadpoints[i + 1],
      quadpoints[i + 3],
      quadpoints[i + 5],
      quadpoints[i + 7]
    );
    boxes.push([x1, y1, x2, y2 ]);
  }
  return boxes;
};

/**
 * fourNumbersToBounds - Convert four numbers into bounds given the page the
 * four numbers are on.
 *
 * @param {import("./api.js").ExtractBounds} numberList
 * @param {import("./api.js").Page} page
 * @returns {import("../math/math.js").Bounds}
 */
export const fourNumbersToBounds = (numberList, page) => {
  const left = numberList[0];
  const right = numberList[2];
  const width = Math.abs(right - left);
  const top = numberList[1];
  const bottom = numberList[3];
  const height = Math.abs(top - bottom);
  /**
   * PDF coordinates go from the bottom to the top, but DOM coordinates go
   * from the top to the bottom. Therefore, to get the final top position,
   * we have to perform this subtraction.
   */
  return {
    top: page.height - bottom,
    left,
    width,
    height,
  };
};

/**
 * groupCharactersIntoWordGroups - Map an array of characters into an array
 * of arrays of characters, where each sub-array represents a word.
 *
 * @param {import("./api.js").Character[]} characters
 * @returns {import("./api.js").Character[][]}
 */
export const groupCharactersIntoWordGroups = (characters) => {
  /** @type {import("./api.js").Character[][]} */
  const out = [];
  /** @type {import("./api.js").Character[]} */
  let cur = [];
  for (const character of characters) {
    if (character.letter !== " ") {
      cur.push(character);
    } else if (cur.length > 0) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length > 0) {
    out.push(cur);
  }
  return out;
};

/**
 * makeWordsFromWordGroups - Convert a grouped list of nested characters into
 * a sub array.
 *
 * @param {import("./api.js").Character[][]} wordGroups
 * @returns {import("./api.js").Word[]}
 */
const makeWordsFromWordGroups = (wordGroups) => {
  /** @type {import("./api.js").Word[]} */
  const out = [];
  for (const wordGroup of wordGroups) {
    /** @type {import("../math/math.js").Bounds} */
    let bounds;
    const { bounds: startBounds, page, paragraph_id } = wordGroup[0];
    if (wordGroup.length > 1) {
      const endBounds = wordGroup[wordGroup.length - 1].bounds;
      bounds = {
        ...startBounds,
        width: Math.abs(startBounds.left - endBounds.left) + endBounds.width,
      };
    } else {
      bounds = startBounds;
    }
    /** @type {import("./api.js").Word} */
    const word = {
      id: serializeBounds(bounds),
      bounds,
      page,
      paragraph_id,
      text: "",
    };
    for (const character of wordGroup) {
      character.id = word.id;
      word.text += character.letter;
    }
    out.push(word);
  }
  return out;
};

/**
 * analyzeElements - Take the results of the extract API and return them
 * as JSON tokens that our library can more easily analyze.
 *
 * @param {import("./api.js").ExtractResult} extractApi
 * @returns {import("./api.js").DocumentContext}
 */
export const analyzeElements = (extractApi) => {
  const { elements, pages } = extractApi;

  const pageMap = new Map();
  for (const page of pages) {
    pageMap.set(page.page_number, page);
  }

  /** @type {import("./api.js").Paragraph[]} */
  let paragraphs = [];
  /** @type {import("./api.js").Character[]} */
  let characters = [];

  for (const element of elements) {
    /**
     * We inline this nasty if expression because doing so guarantees that
     * the TypeScript compiler recognizes element.Text, element.Bounds,
     * element.CharBounds, and element.CharPage are all defined.
     */
    if (
      element.Text !== undefined &&
      element.Bounds !== undefined &&
      element.CharBounds !== undefined &&
      element.Page !== undefined
    ) {
      const curPage = pageMap.get(element.Page);
      const paragraphBounds = fourNumbersToBounds(element.Bounds, curPage);

      /** @type {import("./api.js").Paragraph} */
      const paragraph = {
        id: serializeBounds(paragraphBounds),
        bounds: paragraphBounds,
        page: element.Page,
        text: element.Text,
      };
      paragraphs.push(paragraph);

      if (element.CharBounds.length === element.Text.length) {
        for (let i = 0; i < element.CharBounds.length; ++i) {
          const letter = element.Text[i];
          const charBoundNumbers = element.CharBounds[i];
          const characterBounds = fourNumbersToBounds(
            charBoundNumbers,
            curPage
          );
          characters.push({
            id: serializeBounds(characterBounds),
            bounds: characterBounds,
            page: element.Page,
            letter,
            // NOTE: word_id is mutated in another function.
            word_id: "",
            paragraph_id: paragraph.id,
          });
        }
      }
    }

    if (element.Kids) {
      const childElements = analyzeElements({
        elements: element.Kids,
        pages: pages,
      });
      paragraphs = [...paragraphs, ...childElements.paragraphs];
      characters = [...characters, ...childElements.characters];
    }
  }

  const wordGroups = groupCharactersIntoWordGroups(characters);
  const words = makeWordsFromWordGroups(wordGroups);
  const textContent = paragraphs.map((paragraph) => paragraph.text).join("\n");
  return {
    paragraphs,
    characters,
    words,
    textContent,
    pages: pages,
    extract: extractApi,
  };
};

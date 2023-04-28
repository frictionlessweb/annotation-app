/**
 * searchForString - Search for the presence of a string within a character
 * array.
 *
 * @param {string} str - The string to search for.
 * @param {import("../api/api.js").Character[]} characters - characters in which to serach.
 * @returns {import("../api/api.js").Character[][]}
 */
export const searchForString = (str, characters) => {
  if (str === "") return [];
  /** @type {import("../api/api.js").Character[][]} */
  const out = [];
  /** @type {import("../api/api.js").Character[]} */
  let cur = [];
  /** @type {string} */
  let curString = "";
  let curIdx = 0;

  for (let i = 0; i < characters.length; ++i) {
    const curChar = characters[i];
    let added = false;
    if (curChar.letter === str[curIdx]) {
      curString += curChar.letter;
      cur.push(curChar);
      ++curIdx;
      added = true;
    } else {
      curString = "";
      cur = [];
      curIdx = 0;
    }
    if (curString === str) {
      out.push(cur);
      curString = "";
      cur = [];
      curIdx = 0;
    }
    if (curChar.letter === str[curIdx] && !added) {
      curString += curChar.letter;
      cur.push(curChar);
      ++curIdx;
    }
  }
  return out;
};

/**
 * pageOfString - Find the page that a string occurs on.
 *
 * @param {string} str - The string to search for.
 * @param {import("../api/api.js").Character[]} characters - characters in which to serach.
 * @returns {number}
 */
export const pageOfString = (str, characters) => {
  if (str === "") return -1;
  /** @type {import("../api/api.js").Character[]} */
  let cur = [];
  /** @type {string} */
  let curString = "";
  let curIdx = 0;

  for (let i = 0; i < characters.length; ++i) {
    const curChar = characters[i];
    let added = false;
    if (curChar.letter === str[curIdx]) {
      curString += curChar.letter;
      cur.push(curChar);
      ++curIdx;
      added = true;
    } else {
      curString = "";
      cur = [];
      curIdx = 0;
    }
    if (curString === str) {
      return cur[cur.length - 1].page;
    }
    if (curChar.letter === str[curIdx] && !added) {
      curString += curChar.letter;
      cur.push(curChar);
      ++curIdx;
    }
  }
  return -1;
};

// TYPE DEFINITIONS
export interface Bounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ExtractBounds = [number, number, number, number];

export interface Element {
  Bounds?: ExtractBounds;
  CharBounds?: ExtractBounds[];
  Page?: number;
  Text?: string;
  Kids?: Element[];
}

export interface Page {
  height: number;
  width: number;
  page_number: number;
}

export interface ExtractResult {
  elements: Element[];
  pages: Page[];
}

export interface Paragraph {
  id: string;
  page: number;
  text: string;
  bounds: Bounds;
}

export interface Word {
  id: string;
  page: number;
  text: string;
  bounds: Bounds;
  paragraph_id: string;
}

export interface Character {
  letter: string;
  bounds: Bounds;
  page: number;
  id: string;
  paragraph_id: string;
  word_id: string;
}

export interface AnalyzedDocument {
  paragraphs: Paragraph[];
  words: Word[];
  characters: Character[];
  textContent: string;
  pages: Page[];
}

export interface EmbedAnnotation {

}

// PURE FUNCTIONS
export const serializeBounds = (bounds: Bounds) => {
  return `top${bounds.top}left${bounds.left}width${bounds.width}height${bounds.height}`;
};

export const areOverlapping = (boxOne: Bounds, boxTwo: Bounds) => {
  const verticallySeparate =
    boxOne.top >= boxTwo.top + boxTwo.height ||
    boxTwo.top >= boxOne.top + boxOne.height;
  const horizontallySeparate =
    boxOne.left >= boxTwo.left + boxTwo.width ||
    boxTwo.left >= boxOne.left + boxOne.width;
  return !verticallySeparate && !horizontallySeparate;
};

export const boxContaining = (bounds: Bounds[]) => {
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

export const fourNumbersToBounds = (numberList: ExtractBounds, page: Page) => {
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

export const groupCharactersIntoWordGroups = (characters: Character[]): Character[][] => {
  const out: Character[][] = [];
  let cur: Character[] = [];
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

const makeWordsFromWordGroups = (wordGroups: Character[][]) => {
  const out: Word[] = [];
  for (const wordGroup of wordGroups) {
    let bounds: Bounds;
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
    const word: Word = {
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

export const analyzeElements = (extractApi: ExtractResult): AnalyzedDocument => {
  const { elements, pages } = extractApi;

  const pageMap = new Map();
  for (const page of pages) {
    pageMap.set(page.page_number, page);
  }

  let paragraphs: Paragraph[] = [];
  let characters: Character[] = [];

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

      const paragraph: Paragraph = {
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
  };
}

export const annotationToString = (annotation: EmbedAnnotation, context: AnalyzedDocument): string => {
  return ''
}

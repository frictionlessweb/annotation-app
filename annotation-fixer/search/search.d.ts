import { Character } from "../api/api.js";

export const searchForString: (
  str: string,
  characters: Character[]
) => Character[][];

export const pageOfString: (str: string, characters: Character[]) => number;

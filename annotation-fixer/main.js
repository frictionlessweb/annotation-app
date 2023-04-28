import { walkHighlights } from "./traverse.js";
import { addBodyTextToAnnotation } from "./fix_annotations.js";
import fs from "fs";
import q1Highlights from "./__example__/Q1_highlights.json" assert { type: "json" };
import extract from "./__example__/cur_result.json" assert { type: "json" };

walkHighlights(q1Highlights, (highlight) => {
  addBodyTextToAnnotation(highlight, extract);
});

fs.writeFileSync("results.json", JSON.stringify(q1Highlights), {
  encoding: "utf-8",
});

import { fixAnnotations } from "./fixAnnotations.js";
import process from "process";

const go = (highlightsPath, extractPath, resultPath) => {
  console.log(`
  HIGHLIGHTS PATH: ${highlightsPath}
  EXTRACT PATH: ${extractPath}
  RESULT PATH: ${resultPath}
  RUNNING....
    `);
  fixAnnotations(highlightsPath, extractPath, resultPath);
  console.log("SUCCESS.");
};

if (process.argv.length !== 5) {
  console.warn(
    "Could not parse CLI arguments; running with hard-coded example."
  );
  go(
    "./__example__/Q1_highlights.json",
    "./__example__/extract.json",
    "./__example__/results.json"
  );
} else {
  const highlightsPath = process.argv[2];
  const extractPath = process.argv[3];
  const resultPath = process.argv[4];
  go(highlightsPath, extractPath, resultPath);
}

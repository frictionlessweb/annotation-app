import { walkHighlights } from './traverse';

walkHighlights(require("./__example__/Q1_highlights.json"), (highlight) => {
  console.log(highlight);
});

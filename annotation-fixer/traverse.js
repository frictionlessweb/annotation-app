const GENERATED_QUESTION_KEYS = [
  "question_one",
  "question_two",
  "question_three",
];

/**
 * walkHighlights - Run the provided callback on each highlight in
 * the annotation responses.
 *
 * @param {object[]} annotationResponses
 * @param {(annotation: object) => void} callback
 */
export const walkHighlights = (annotationResponses, callback) => {
  for (const response of annotationResponses) {
    const { user_responses } = response;
    for (const highlight of user_responses.INTRO_DOCUMENT.highlights) {
      callback(highlight);
    }
    for (const key of GENERATED_QUESTION_KEYS) {
      const { highlights } = user_responses.GENERATED_QUESTIONS[key];
      for (const highlight of highlights) {
        callback(highlight);
      }
    }
  }
};

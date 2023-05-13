#!/usr/bin/env node

const fs = require("fs");

const deepClone = (json) => {
  return JSON.parse(JSON.stringify(json));
};

const ANSWER_BASE = {
  text: "",
  system: "",
  overall_rating: 1,
  "Does this answer provide enough information for the question?": "",
  "Does this answer provide inaccurate information?": "",
  "Does this answer provide information not found in the document?": "",
  "Does this answer completely answer the whole question?": "",
  "Is it easy to read this answer?": "",
  "Is this answer relevant to the question?": "",
  "Do you feel the answer is wordy?": "",
  "Do you believe or trust this answer?": "",
  "Do you need more details?": "",
  "Are there any new ideas or concepts in this answer that make you somewhat surprised?":
    "",
  "Is this answer useful or helpful to address the question?": "",
  "Do you think this answer has been written by an expert?": "",
};

const BASE = {
  ANSWER_QUALITY: {},
  GENERATED_QUESTIONS: {
    question_one: {
      text: "What is the revenue potential from financial trading taxes and which financial assets would contribute the most to this revenue?",
      highlights: [],
    },
    question_two: {
      text: "Who are the authors of the paper and what is their affiliation?",
      highlights: [],
    },
    question_three: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
  },
};

const dataset = require("./question_answer_dataset.json");

for (const el of dataset) {
  if (el.qa_pairs.length === 0) {
    continue;
  }

  const answer = deepClone(BASE);

  const setQuestionText = (questionMap, question, map) => {
    map.GENERATED_QUESTIONS[question].text = questionMap.question_text;
  };

  setQuestionText(el.qa_pairs[0], "question_one", answer);
  setQuestionText(el.qa_pairs[1], "question_two", answer);
  setQuestionText(el.qa_pairs[2], "question_three", answer);

  const setAnswerQuality = (questionMap, question, map) => {
    map.ANSWER_QUALITY[question] = {};
    map.ANSWER_QUALITY[question].text = questionMap.question_text;
    map.ANSWER_QUALITY[question].index = 0;
    map.ANSWER_QUALITY[question].answers = questionMap.answer.map(
      (qaPair) => {
        const base = deepClone(ANSWER_BASE);
        base.text = qaPair.answer_text;
        base.system = qaPair.system;
        return base;
      }
    );
  };

  setAnswerQuality(el.qa_pairs[0], "question_one", answer);
  setAnswerQuality(el.qa_pairs[1], "question_two", answer);
  setAnswerQuality(el.qa_pairs[2], "question_three", answer);
  const finalFilePath = `${el.document_id}.json`;
  const finalJson = JSON.stringify(answer);
  fs.writeFileSync(finalFilePath, finalJson, { encoding: "utf-8" });
}

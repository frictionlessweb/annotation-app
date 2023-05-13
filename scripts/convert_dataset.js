#!/usr/bin/env node

const fs = require("fs");

const deepClone = (json) => {
  return JSON.parse(JSON.stringify(json));
};

const ANSWER_BASE = {
  text: "",
  system: "",
  overall_rating: 1,
  "Is an answer provided?": "",
  "The answer provides enough information for the question.": "",
  "The answer provides inaccurate information.": "",
  "The answer provides information not found in the document.": "",
  "The answer completely answers the whole question.": "",
  "The answer is relevant to the question.": "",
  "The answer is wordy.": "",
  "The answer is believable.": "",
  "The answer lacks details from the document.": "",
  "The answer covers new ideas or concepts that are surprising.": "",
  "The answer has been written by an expert.": "",
  "The answer contains irrelevant information.": "",
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
    map.ANSWER_QUALITY[question].answers = questionMap.answer.map((qaPair) => {
      const base = deepClone(ANSWER_BASE);
      base.text = qaPair.answer_text;
      base.system = qaPair.system;
      return base;
    });
  };

  setAnswerQuality(el.qa_pairs[0], "question_one", answer);
  setAnswerQuality(el.qa_pairs[1], "question_two", answer);
  setAnswerQuality(el.qa_pairs[2], "question_three", answer);
  const finalFilePath = `${el.document_id}.json`;
  const finalJson = JSON.stringify(answer);
  fs.writeFileSync(finalFilePath, finalJson, { encoding: "utf-8" });
}

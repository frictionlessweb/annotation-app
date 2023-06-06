#!/usr/bin/env node

const fs = require("fs");

const deepClone = (json) => {
  return JSON.parse(JSON.stringify(json));
};

const ANSWER_BASE = {
  text: "",
  system: "",
  overall_rating: 1,
  confidence_rating: 1,
  inaccurate_text: "",
  external_text: "",
  "Does any part of the answer say 'I don’t know' or that there’s 'insufficient context' to provide an answer?":
    "",
  "The answer is relevant to the question (regardless of whether the details are correct or not).":
    "",
  "The answer contains inaccurate information (e.g., information that is made up or not true).":
    "",
  "The answer contains information not found in the document (e.g., information that does not exist in this document).":
    "",
  "The answer contains irrelevant information (e.g., information that is irrelevant).":
    "",
  "This answer is useful and helpful to address this question.": "",
  "The answer contains enough information for the question.": "",
  "The answer completely answers the whole question (e.g., it covers every aspect of the question).":
    "",
  "The answer is missing specific details from the document.": "",
  "The answer is wordy (e.g., unnecessarily long or contains unnecessary words).":
    "",
  "The answer is easy to read and comprehend.": "",
  "The answer has been written by an expert.": "",
  "I can trust this answer": "",
};

const BASE = {
  ANSWER_QUALITY: {},
  GENERATED_QUESTIONS: {
    q1: {
      text: "What is the revenue potential from financial trading taxes and which financial assets would contribute the most to this revenue?",
      highlights: [],
    },
    q2: {
      text: "Who are the authors of the paper and what is their affiliation?",
      highlights: [],
    },
    q3: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
    q4: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
    q5: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
    q6: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
    q7: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
    q8: {
      text: "What is the methodology used to calculate the tax rate structure and sources for the revenue projections in Table 1?",
      highlights: [],
    },
  },
};

const dataset = require("./sample_questions.json");

for (const el of dataset) {
  if (el.qa_pairs.length === 0) {
    continue;
  }

  const answer = deepClone(BASE);

  const setQuestionText = (questionMap, question, map) => {
    map.GENERATED_QUESTIONS[question].text = questionMap.question_text;
  };

  for (let i = 0; i < el.qa_pairs.length; i++) {
    text = "q" + i.toString();
    setQuestionText(el.qa_pairs[i], "q" + (i + 1).toString(), answer);
  }

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

  for (let i = 0; i < el.qa_pairs.length; i++) {
    text = "q" + i.toString();
    setAnswerQuality(el.qa_pairs[i], "q" + (i + 1).toString(), answer);
  }
  const finalFilePath = `${el.document_id}.json`;
  const finalJson = JSON.stringify(answer);
  fs.writeFileSync(finalFilePath, finalJson, { encoding: "utf-8" });
}

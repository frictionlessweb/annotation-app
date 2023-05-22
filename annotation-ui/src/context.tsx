import React from "react";
import { Loading } from "../src/components/Loading";
import { FatalApiError } from "../src/components/FatalApiError";

interface HasId {
  id: string;
  [data: string]: unknown;
}

export const GENERATED_QUESTION_ORDER = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8"
] as const;

export const ANSWER_QUALITY_ITEMS = [
  "The answer is relevant to the question (regardless of whether the details are correct or not).",
  "This answer is useful and helpful to address this question.",
  "The answer contains enough information for the question.",
  "The answer completely answers the whole question (e.g., it covers every aspect of the question).",
  "The answer is missing specific details from the document.",
  "The answer is wordy (e.g., unnecessarily long or contains unnecessary words).",
  "The answer is easy to read and comprehend.",
  "The answer contains inaccurate information (e.g., information that is made up or not true).",
  "The answer contains information not found in the document (e.g., information that does not exist in this document).",
  "The answer contains irrelevant information (e.g., information that is irrelevant).",
  "The answer has been written by an expert.",
  "I can trust this answer",
] as const;

interface Answer {
  text: string;
  system: string;
  overall_rating: number;
  "Does any part of the answer say 'I don’t know' or that there’s 'insufficient context' to provide an answer?": string;
  "The answer is relevant to the question (regardless of whether the details are correct or not).": string;
  "This answer is useful and helpful to address this question.": string;
  "The answer contains enough information for the question.": string;
  "The answer completely answers the whole question (e.g., it covers every aspect of the question).": string;
  "The answer is missing specific details from the document.": string;
  "The answer is wordy (e.g., unnecessarily long or contains unnecessary words).": string;
  "The answer is easy to read and comprehend.": string;
  "The answer contains inaccurate information (e.g., information that is made up or not true).": string;
  "The answer contains information not found in the document (e.g., information that does not exist in this document).": string;
  "The answer contains irrelevant information (e.g., information that is irrelevant).": string;
  "The answer has been written by an expert.": string;
  "I can trust this answer": string;
}

export type AnswerKey = keyof Answer;

const DEFAULT_ANSWER: Answer = {
  text: "",
  system: "",
  overall_rating: 1,
  "Does any part of the answer say 'I don’t know' or that there’s 'insufficient context' to provide an answer?": "",
  "The answer is relevant to the question (regardless of whether the details are correct or not).": "",
  "This answer is useful and helpful to address this question.": "",
  "The answer contains enough information for the question.": "",
  "The answer completely answers the whole question (e.g., it covers every aspect of the question).": "",
  "The answer is missing specific details from the document.": "",
  "The answer is wordy (e.g., unnecessarily long or contains unnecessary words).": "",
  "The answer is easy to read and comprehend.": "",
  "The answer contains inaccurate information (e.g., information that is made up or not true).": "",
  "The answer contains information not found in the document (e.g., information that does not exist in this document).": "",
  "The answer contains irrelevant information (e.g., information that is irrelevant).": "",
  "The answer has been written by an expert.": "",
  "I can trust this answer": "",
};

export const POSSIBLE_ANSWERS = [
  "Strongly Disagree",
  "Disagree",
  "Undecided",
  "Agree",
  "Strongly Agree",
];

export const answerIsComplete = (ans: Answer): boolean => {
  return ANSWER_QUALITY_ITEMS.every((item) => ans[item] !== "");
};

export interface ApiResult {
  pdf_url: string;
  image_url: string;
  stage: Stage;
  user_name: string;
  user_responses: {
    INTRO_TASK: {
      question_1: string;
      question_2: string;
      preview_response: string;
    };
    INTRO_DOCUMENT: {
      highlights: Array<HasId>;
    };
    GENERATED_QUESTIONS: {
      q1: {
        text: string;
        highlights: HasId[];
      },
      q2: {
        text: string;
        highlights: HasId[];
      },
      q3: {
        text: string;
        highlights: HasId[];
      },
      q4: {
        text: string;
        highlights: HasId[];
      },
      q5: {
        text: string;
        highlights: HasId[];
      },
      q6: {
        text: string;
        highlights: HasId[];
      },
      q7: {
        text: string;
        highlights: HasId[];
      },
      q8: {
        text: string;
        highlights: HasId[];
      }
    };
    ANSWER_QUALITY: {
      q1: {
        text: string;
        index: 0;
        answers: Answer[];
      },
      q2: {
        text: string;
        index: number;
        answers: Answer[];
      },
      q3: {
        text: string;
        index: number;
        answers: Answer[];
      },
      q4: {
        text: string;
        index: number;
        answers: Answer[];
      },
      q5: {
        text: string;
        index: number;
        answers: Answer[];
      },
      q6: {
        text: string;
        index: number;
        answers: Answer[];
      },
      q7: {
        text: string;
        index: number;
        answers: Answer[];
      },
      q8: {
        text: string;
        index: number;
        answers: Answer[];
      }
    };
    SUGGESTED_QUESTIONS: {
      question_easy: string;
      question_medium: string;
      question_hard: string;
      question_external: string;
      question_unrelated: string;
    };
    current_generated_question: number;
    current_answer_quality: number;
  };
  pdfRef: null | any;
}

export const STAGE_MAP = {
  INTRO_TASK: {
    order: 1,
    value: "INTRO_TASK",
    display: "Intro Task",
  },
  INTRO_DOCUMENT: {
    order: 2,
    value: "INTRO_DOCUMENT",
    display: "Intro Document",
  },
  GENERATED_QUESTIONS: {
    order: 3,
    value: "GENERATED_QUESTIONS",
    display: "Generated Questions",
  },
  ANSWER_QUALITY: {
    order: 4,
    value: "ANSWER_QUALITY",
    display: "Answer Quality",
  },
  SUGGESTED_QUESTIONS: {
    order: 5,
    value: "SUGGESTED_QUESTIONS",
    display: "Suggested Questions",
  },
  DONE: {
    order: 6,
    value: "DONE",
    display: "Done",
  },
} as const;

const DEFAULT_DOCUMENT_STATE: ApiResult = {
  pdfRef: null,
  pdf_url: "",
  image_url: "",
  user_name: "",
  stage: "INTRO_TASK",
  user_responses: {
    INTRO_TASK: {
      preview_response: "",
      question_1: "",
      question_2: "",
    },
    INTRO_DOCUMENT: {
      highlights: [],
    },
    GENERATED_QUESTIONS: {
      q1: {
        text: "Example question",
        highlights: [],
      },
      q2: {
        text: "Example question",
        highlights: [],
      },
      q3: {
        text: "Example question",
        highlights: [],
      },
      q4: {
        text: "Example question",
        highlights: [],
      },
      q5: {
        text: "Example question",
        highlights: [],
      },
      q6: {
        text: "Example question",
        highlights: [],
      },
      q7: {
        text: "Example question",
        highlights: [],
      },
      q8: {
        text: "Example question",
        highlights: [],
      }
    },
    ANSWER_QUALITY: {
      q1: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q2: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q3: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q4: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q5: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q6: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q7: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      q8: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      }
    },
    SUGGESTED_QUESTIONS: {
      question_easy: "",
      question_medium: "",
      question_hard: "",
      question_external: "",
      question_unrelated: ""
    },
    current_generated_question: 0,
    current_answer_quality: 0,
  },
};

export type Stage = keyof typeof STAGE_MAP;

export type DocumentState = "NOT_LOADED" | "API_ERROR" | ApiResult;

export const DocumentContext = React.createContext<DocumentState | null>(null);

export const UpdateDocumentContext = React.createContext<React.Dispatch<
  React.SetStateAction<DocumentState>
> | null>(null);

interface DocumentRouterProps {
  children: React.ReactNode;
}

export const DocumentFetcher = (props: DocumentRouterProps) => {
  const { children } = props;
  const documentName = window.location.pathname.split("/").pop();
  const [docState, setDocState] = React.useState<DocumentState>("NOT_LOADED");
  React.useEffect(() => {
    const storedDoc = window.localStorage.getItem(documentName || "");
    const fetchDoc = async () => {
      if (docState === "NOT_LOADED") {
        try {
          const res = await window.fetch(
            `/api/v1/documents?id=${documentName}`,
            {
              method: "GET",
            }
          );
          if (!res.ok) {
            throw new Error("BAD RESPONSE");
          }
          const theJson = await res.json();
          setDocState({
            ...DEFAULT_DOCUMENT_STATE,
            ...theJson,
            stage:
              storedDoc === null ? "INTRO_TASK" : JSON.parse(storedDoc).stage,
            user_responses:
              storedDoc === null
                ? {
                    ...DEFAULT_DOCUMENT_STATE.user_responses,
                    ...theJson.user_responses,
                  }
                : JSON.parse(storedDoc).user_responses,
          });
        } catch (err) {
          setDocState("API_ERROR");
        }
      }
    };
    fetchDoc();
  }, [docState, documentName]);
  switch (docState) {
    case "NOT_LOADED": {
      return <Loading />;
    }
    case "API_ERROR": {
      return <FatalApiError />;
    }
    default: {
      return (
        <DocumentContext.Provider value={docState}>
          <UpdateDocumentContext.Provider value={setDocState}>
            {children}
          </UpdateDocumentContext.Provider>
        </DocumentContext.Provider>
      );
    }
  }
};

export const useDocumentContext = (): ApiResult => {
  const ctx = React.useContext(DocumentContext);
  if (ctx === null || ctx === "NOT_LOADED" || ctx === "API_ERROR") {
    throw new Error("Please use useDocumentContext inside its provider.");
  }
  return ctx;
};

export const useSetDoc = () => {
  const ctx = React.useContext(UpdateDocumentContext);
  if (ctx === null) {
    throw new Error("Please use setDocContext inside its provider.");
  }
  return ctx;
};

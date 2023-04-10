import React from "react";
import { Loading } from "../src/components/Loading";
import { FatalApiError } from "../src/components/FatalApiError";

interface HasId {
  id: string;
  [data: string]: unknown;
}

export const GENERATED_QUESTION_ORDER = [
  "question_one",
  "question_two",
  "question_three",
] as const;

export const ANSWER_QUALITY_ITEMS = [
  "Does this answer provide enough information for the question?",
  "Does this answer provide inaccurate information?",
  "Does this answer provide information not found in the document?",
  "Does this answer completely answer the whole question?",
  "Is it easy to read this answer?",
  "Is this answer relevant to the question?",
  "Do you feel the answer is wordy?",
  "Do you believe or trust this answer?",
  "Do you need more details?",
  "Are there any new ideas or concepts in this answer that make you somewhat surprised?",
  "Is this answer useful or helpful to address the question?",
  "Do you think this answer has been written by an expert?",
] as const;

interface Answer {
  text: string;
  overall_rating: number;
  "Does this answer provide enough information for the question?": string;
  "Does this answer provide inaccurate information?": string;
  "Does this answer provide information not found in the document?": string;
  "Does this answer completely answer the whole question?": string;
  "Is it easy to read this answer?": string;
  "Is this answer relevant to the question?": string;
  "Do you feel the answer is wordy?": string;
  "Do you believe or trust this answer?": string;
  "Do you need more details?": string;
  "Are there any new ideas or concepts in this answer that make you somewhat surprised?": string;
  "Is this answer useful or helpful to address the question?": string;
  "Do you think this answer has been written by an expert?": string;
}

export type AnswerKey = keyof Answer;

const DEFAULT_ANSWER: Answer = {
  text: "this is the example answer",
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

export const answerIsComplete = (ans: Answer): boolean => {
  return ANSWER_QUALITY_ITEMS.every(item => ans[item] !== '');
}

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
      question_one: {
        text: string;
        highlights: HasId[];
      };
      question_two: {
        text: string;
        highlights: HasId[];
      };
      question_three: {
        text: string;
        highlights: HasId[];
      };
    };
    ANSWER_QUALITY: {
      question_one: {
        text: string;
        index: 0;
        answers: Answer[];
      };
      question_two: {
        text: string;
        index: number;
        answers: Answer[];
      };
      question_three: {
        text: string;
        index: number;
        answers: Answer[];
      };
    };
    SUGGESTED_QUESTIONS: {
      question_one: string;
      question_two: string;
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
  user_name: '',
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
      question_one: {
        text: "Example question one",
        highlights: [],
      },
      question_two: {
        text: "Example question two",
        highlights: [],
      },
      question_three: {
        text: "Example question three",
        highlights: [],
      },
    },
    ANSWER_QUALITY: {
      question_one: {
        text: "Example question one",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      question_two: {
        text: "Example question two",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
      question_three: {
        text: "Example question three",
        answers: [DEFAULT_ANSWER, DEFAULT_ANSWER],
        index: 0,
      },
    },
    SUGGESTED_QUESTIONS: {
      question_one: "",
      question_two: "",
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

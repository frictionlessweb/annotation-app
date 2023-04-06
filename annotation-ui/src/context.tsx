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

export interface ApiResult {
  pdf_url: string;
  image_url: string;
  stage: Stage;
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
    current_generated_question: number;
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
  stage: "GENERATED_QUESTIONS",
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
    current_generated_question: 0,
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
    const fetchDoc = async () => {
      if (docState === "NOT_LOADED") {
        try {
          const res = await window.fetch(
            `/api/v1/documents?id=${documentName}`,
            {
              method: "GET",
            }
          );
          const theJson = await res.json();
          setDocState({ ...DEFAULT_DOCUMENT_STATE, ...theJson });
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

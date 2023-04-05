import React from "react";
import { Loading } from "../src/components/Loading";
import { FatalApiError } from "../src/components/FatalApiError";

export const STAGE_MAP = {
  INTRO_TASK: {
    order: 0,
    value: "INTRO_TASK",
  },
  INTRO_DOCUMENT: {
    order: 1,
    value: "INTRO_DOCUMENT",
  },
  GENERATED_QUESTIONS: {
    order: 2,
    value: "GENERATED_QUESTIONS",
  },
  ANSWER_QUALITY: {
    order: 3,
    value: "ANSWER_QUALITY",
  },
  SUGGESTED_QUESTIONS: {
    order: 4,
    value: "SUGGESTED_QUESTIONS",
  },
} as const;

const DEFAULT_DOCUMENT_STATE: ApiResult = {
  pdf_url: "",
  image_url: "",
  stage: "INTRO_TASK",
};

export type Stage = keyof typeof STAGE_MAP;

export interface ApiResult {
  pdf_url: string;
  image_url: string;
  stage: Stage;
}

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
          setDocState({ ...theJson, ...DEFAULT_DOCUMENT_STATE });
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

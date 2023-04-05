import React from "react";
import {
  Flex,
  Button,
  Picker,
  Tabs,
  TabList,
  Item,
  Text,
  Heading,
  ActionGroup,
  View,
} from "@adobe/react-spectrum";
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

export type Stage = keyof typeof STAGE_MAP;

interface ApiResult {
  pdf_url: string;
  image_url: string;
  stage: Stage;
}

const DEFAULT_DOCUMENT_STATE: ApiResult = {
  pdf_url: "",
  image_url: "",
  stage: "INTRO_TASK",
};

type DocumentState = "NOT_LOADED" | "API_ERROR" | ApiResult;

const DocumentContext = React.createContext<DocumentState | null>(null);

const UpdateDocumentContext = React.createContext<React.Dispatch<
  React.SetStateAction<DocumentState>
> | null>(null);

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

const IntroTask = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const IntroDocument = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const GeneratedQuestions = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const AnswerQuality = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const SuggestedQuestions = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const StageRouter = () => {
  const ctx = useDocumentContext();
  switch (ctx.stage) {
    case "INTRO_TASK": {
      return <IntroTask />;
    }
    case "INTRO_DOCUMENT": {
      return <IntroDocument />;
    }
    case "GENERATED_QUESTIONS": {
      return <GeneratedQuestions />;
    }
    case "ANSWER_QUALITY": {
      return <AnswerQuality />;
    }
    case "SUGGESTED_QUESTIONS": {
      return <SuggestedQuestions />;
    }
    default: {
      throw new Error(`Unexpected stage: ${ctx.stage}`);
    }
  }
};

const DocumentForm = () => {
  return <StageRouter />;
};

export const DocumentRouter = () => {
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
            <DocumentForm />
          </UpdateDocumentContext.Provider>
        </DocumentContext.Provider>
      );
    }
  }
};

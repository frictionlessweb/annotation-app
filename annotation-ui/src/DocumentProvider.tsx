import React from "react";
import { Loading } from "./Loading";
import { FatalApiError } from "./FatalApiError";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AdobeDC?: any;
  }
}

export interface AdobeApiHandler {
  gotoLocation: (
    page: number,
    xCoordinate: number,
    yCoordinate: number
  ) => Promise<void>;
}

type TopicResponses = Record<TopicId, AnnotationResponse[]>;

interface HasId {
  id: string;
  [otherVar: string | number]: any;
}

interface Document {
  pdf_url: string;
  title: string;
  topics: Record<TopicId, HasId[]>;
}

type DocumentCollection = Record<string, Document>;

interface AnnotationResponse {
  id: string;
  liked: boolean | null;
}

type TopicId = string;

type DocumentId = string;

type AnnotationResponseCollection = Record<DocumentId, TopicResponses>;

export const documentsToAnnotationResponse = (
  documents: DocumentCollection
): AnnotationResponseCollection => {
  const response: AnnotationResponseCollection = {};
  for (const key of Object.keys(documents)) {
    const documentObject = documents[key];
    const newObject: Record<TopicId, AnnotationResponse[]> = {};
    for (const topicKey of Object.keys(documentObject.topics)) {
      newObject[topicKey] = Array.isArray(newObject[topicKey])
        ? newObject[topicKey]
        : [];
      for (const annotation of documentObject.topics[topicKey]) {
        newObject[topicKey].push({ id: annotation.id, liked: null });
      }
    }
    // @ts-ignore
    response[key] = { topics: newObject };
  }
  return response;
};

const fetchDocuments = async (): Promise<DocumentCollection> => {
  const res = await window.fetch("/api/v1/documents", { method: "GET" });
  return res.json();
};

interface DocContext {
  documents: DocumentCollection;
  annotationResponses: AnnotationResponseCollection;
  selectedDocument: null;
  apis: React.MutableRefObject<AdobeApiHandler | null>;
}

type DocumentState = "LOADING" | "FAILURE" | DocContext;

const AdobeDocContext = React.createContext<DocContext | null>(null);

export const useAdobeDocContext = (): DocContext => {
  const ctx = React.useContext(AdobeDocContext);
  if (ctx === null) {
    throw new Error("Please use useAdobeDocContext inside of its provider.");
  }
  return ctx;
};

interface AdobeDocProviderProps {
  children: React.ReactNode;
}

export const AdobeDocProvider = (props: AdobeDocProviderProps) => {
  const apisRef = React.useRef<AdobeApiHandler | null>(null);
  const [state, setState] = React.useState<DocumentState>("LOADING");
  React.useEffect(() => {
    const getDocuments = async () => {
      try {
        const documents = await fetchDocuments();
        setState({
          apis: apisRef,
          documents,
          selectedDocument: null,
          annotationResponses: {},
        });
      } catch (err) {
        setState("FAILURE");
      }
    };
    getDocuments();
  }, [setState]);
  const { children } = props;
  switch (state) {
    case "LOADING": {
      return <Loading />;
    }
    case "FAILURE": {
      return <FatalApiError />;
    }
  }
  return (
    <AdobeDocContext.Provider value={state}>
      {children}
    </AdobeDocContext.Provider>
  );
};

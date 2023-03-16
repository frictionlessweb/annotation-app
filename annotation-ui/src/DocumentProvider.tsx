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
  locationApis: {
    gotoLocation: (
      page: number,
      xCoordinate: number,
      yCoordinate: number
    ) => Promise<void>;
  };
  annotationApis: {
    getAnnotations: () => Promise<Array<unknown>>;
    addAnnotations: (array: Array<any>) => Promise<void>;
    removeAnnotationsFromPDF: () => Promise<void>;
  };
}

type TopicId = string;

type DocumentId = string;

type AnnotationId = string;

type AnnotationRecord = Record<AnnotationId, boolean | null>;

type TopicResponses = Record<TopicId, AnnotationRecord>;

type AnnotationResponseCollection = Record<DocumentId, TopicResponses>;

export type VIEW_TAB = "HIGHLIGHTS" | "ATTRIBUTIONS";

export interface HasId {
  id: string;
  [otherVar: string | number]: any;
}

export interface ApiAnnotation {
  text: string;
  annotation: HasId,
}

interface Document {
  pdf_url: string;
  title: string;
  topics: Record<TopicId, ApiAnnotation[]>;
}

type DocumentCollection = Record<string, Document>;

export const annotationsComplete = (annotations: AnnotationRecord): boolean => {
  return Object.keys(annotations).every(
    (id) => typeof annotations[id] === "boolean"
  );
};

export const topicsComplete = (topics: TopicResponses): boolean => {
  return Object.keys(topics).every((topicId) =>
    annotationsComplete(topics[topicId])
  );
};

export const documentsComplete = (
  documents: AnnotationResponseCollection
): boolean => {
  return Object.keys(documents).every((documentId) => {
    return topicsComplete(documents[documentId]);
  });
};

export const documentsToAnnotationResponses = (
  documents: DocumentCollection
): AnnotationResponseCollection => {
  const response: AnnotationResponseCollection = {};
  for (const key of Object.keys(documents)) {
    const documentObject = documents[key];
    const topics: Record<TopicId, AnnotationRecord> = {};
    for (const topicKey of Object.keys(documentObject.topics)) {
      const topicMap: Record<string, boolean | null> = {};
      topics[topicKey] = topicMap;
      for (const annotation of documentObject.topics[topicKey]) {
        topicMap[annotation.annotation.id] = null;
      }
    }
    response[key] = topics;
  }
  return response;
};

const fetchDocuments = async (): Promise<DocumentCollection> => {
  const res = await window.fetch("/api/v1/documents", { method: "GET" });
  return res.json();
};

type UserAnnotations = Record<DocumentId, Record<TopicId, HasId[]>>;

interface DocContext {
  documents: DocumentCollection;
  annotationResponses: AnnotationResponseCollection;
  userAnnotations: UserAnnotations;
  selectedDocument: null | string;
  selectedTopic: null | string;
  selectedAnnotation: null | string;
  selectedTab: VIEW_TAB;
  apis: React.MutableRefObject<AdobeApiHandler | null>;
  currentPage: number;
}

type DocumentState = "LOADING" | "FAILURE" | DocContext;

const AdobeDocContext = React.createContext<DocContext | null>(null);

const UpdateDocContext = React.createContext<React.Dispatch<
  React.SetStateAction<DocContext>
> | null>(null);

export const useSetAdobeDoc = () => {
  const ctx = React.useContext(UpdateDocContext);
  if (ctx === null) {
    throw new Error("Please use the setAdobeDoc inside of its provider.");
  }
  return ctx;
};

export const useAdobeDocContext = (): DocContext => {
  const ctx = React.useContext(AdobeDocContext);
  if (ctx === null) {
    throw new Error("Please use useAdobeDocContext inside of its provider.");
  }
  return ctx;
};

export const makeUserAnnotations = (
  collection: DocumentCollection
): UserAnnotations => {
  const out: UserAnnotations = {};
  const docIds = Object.keys(collection);
  for (const docId of docIds) {
    out[docId] = {};
    const curDoc = out[docId];
    const topics = collection[docId].topics;
    const topicIds = Object.keys(topics);
    for (const topicId of topicIds) {
      curDoc[topicId] = [];
    }
  }
  return out;
};

export const messageFromDocContext = (ctx: DocContext): string | string[] => {
  const pairs = [];
  for (const documentId of Object.keys(ctx.annotationResponses)) {
    const topicsForDocument = ctx.annotationResponses[documentId];
    for (const topicId of Object.keys(topicsForDocument)) {
      const annotations = topicsForDocument[topicId];
      if (!annotationsComplete(annotations)) {
        pairs.push({ documentId, topicId });
      }
    }
  }
  if (pairs.length === 0) {
    return `Congratulations, you have finished the task!`;
  }
  return pairs.map(
    (pair) => `Document ${pair.documentId} and Topic ${pair.topicId}`
  );
};

interface AdobeDocProviderProps {
  children: React.ReactNode;
}

export const AdobeDocProvider = (props: AdobeDocProviderProps) => {
  const apisRef = React.useRef<AdobeApiHandler | null>(null);
  const [state, setState] = React.useState<DocumentState>("LOADING");
  const setDocument = setState as React.Dispatch<
    React.SetStateAction<DocContext>
  >;
  React.useEffect(() => {
    const getDocuments = async () => {
      try {
        const documents = await fetchDocuments();
        setState({
          apis: apisRef,
          documents,
          selectedDocument: null,
          selectedTopic: null,
          selectedAnnotation: null,
          annotationResponses: documentsToAnnotationResponses(documents),
          userAnnotations: makeUserAnnotations(documents),
          currentPage: 1,
          selectedTab: "HIGHLIGHTS",
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
    <UpdateDocContext.Provider value={setDocument}>
      <AdobeDocContext.Provider value={state}>
        {children}
      </AdobeDocContext.Provider>
    </UpdateDocContext.Provider>
  );
};

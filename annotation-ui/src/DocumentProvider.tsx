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
  annotation: HasId;
}

interface Document {
  pdf_url: string;
  title: string;
  highlights: Record<TopicId, ApiAnnotation[]>;
  attributions: Record<
    TopicId,
    { statement: string; annotations: ApiAnnotation[] }
  >;
}

type DocumentCollection = Record<string, Document>;

type UserResponses = Record<
  DocumentId,
  Record<TopicId, Record<AnnotationId, boolean | null>>
>;

const fetchDocuments = async (): Promise<DocumentCollection> => {
  const res = await window.fetch("/api/v1/documents", { method: "GET" });
  return res.json();
};

export const userResponsesFromDocuments = (
  documents: DocumentCollection
): UserResponses => {
  const out: UserResponses = {};
  const docIds = Object.keys(documents);
  for (const docId of docIds) {
    const topicMap: Record<TopicId, Record<AnnotationId, boolean | null>> = {};
    const curDoc = documents[docId];

    // Handle highlights.
    const highlightTopicIds = Object.keys(curDoc.highlights);
    for (const topicId of highlightTopicIds) {
      const annotationMap: Record<AnnotationId, boolean | null> = {};
      const curHighlightArray = curDoc.highlights[topicId];
      for (const annotation of curHighlightArray) {
        annotationMap[annotation.annotation.id] = null;
      }
      topicMap[topicId] = annotationMap;
    }

    // Handle attributions.
    const attributionTopicIds = Object.keys(curDoc.attributions);
    for (const topicId of attributionTopicIds) {
      const annotationMap: Record<AnnotationId, boolean | null> = {};
      const curAttributionMap = curDoc.attributions[topicId];
      for (const annotation of curAttributionMap.annotations) {
        annotationMap[annotation.annotation.id] = null;
      }
      topicMap[topicId] = annotationMap;
    }
    out[docId] = topicMap;
  }
  return out;
};

interface DocContext {
  documents: DocumentCollection;
  selectedTab: VIEW_TAB;
  selectedAnnotation: null | string;
  apis: React.MutableRefObject<AdobeApiHandler | null>;
  currentPage: number;
  selectedDocument: null | string;
  selectedTopic: null | string;
  userResponses: UserResponses;
}

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

interface AdobeDocProviderProps {
  children: React.ReactNode;
}

type DocumentState = "LOADING" | "FAILURE" | DocContext;

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
          currentPage: 1,
          selectedTab: "HIGHLIGHTS",
          userResponses: userResponsesFromDocuments(documents),
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

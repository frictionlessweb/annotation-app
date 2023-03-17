import React from "react";
import { Loading } from "./Loading";
import { FatalApiError } from "./FatalApiError";
import assignments from "./assignments.json";

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
    selectAnnotation: (annotation: any) => Promise<void>;
    removeAnnotationsFromPDF: () => Promise<void>;
  };
}

type TopicId = string;

type DocumentId = string;

type AnnotationId = string;

type AnnotationRecord = Record<AnnotationId, boolean | null>;

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
  const result = await res.json();
  return result;
};

const findRelevantDocuments = (
  user: string,
  documents: DocumentCollection
): DocumentCollection => {
  const assignment = assignments.find((assignment) => assignment.user === user);
  if (assignment === undefined) return documents;
  const out: DocumentCollection = {};
  for (const document of assignment.documents) {
    out[document] = documents[document];
  }
  return out;
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

export const tabFromAnnotationId = (
  id: string,
  doc: DocumentCollection
): VIEW_TAB => {
  const annotationIds = Object.values(doc).flatMap((aDoc) =>
    Object.values(aDoc.highlights).flatMap((aHighlightList) =>
      aHighlightList.map((anAnnotation) => anAnnotation.annotation.id)
    )
  );
  return new Set(annotationIds).has(id) ? "HIGHLIGHTS" : "ATTRIBUTIONS";
};

export const tabFromTopic = (topic: string, document: Document): VIEW_TAB => {
  const highlightSet = new Set(Object.keys(document.highlights));
  return highlightSet.has(topic) ? "HIGHLIGHTS" : "ATTRIBUTIONS";
};

export const topicsFromDocument = (document: Document): string[] => {
  const unsortedResult = Object.keys(document.highlights).concat(
    Object.keys(document.attributions)
  );
  return unsortedResult.sort((a, b) => {
    if (a === "Generic Highlights") return -1;
    if (a.includes("Question") && !b.includes("Question")) return 1;
    return a < b ? -1 : 1;
  });
};

export interface DocContext {
  documents: DocumentCollection;
  selectedTab: VIEW_TAB;
  selectedAnnotation: null | string;
  apis: React.MutableRefObject<AdobeApiHandler | null>;
  currentPage: number;
  selectedDocument: null | string;
  selectedTopic: null | string;
  missingAnnotations: Set<string>;
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

export const annotationsFromContext = (
  context: DocContext
): ApiAnnotation[] => {
  if (context.selectedDocument === null || context.selectedTopic === null)
    return [];
  const currentDoc = context.documents[context.selectedDocument];
  if (context.selectedTopic in currentDoc.highlights) {
    return currentDoc.highlights[context.selectedTopic];
  } else {
    return currentDoc.attributions[context.selectedTopic].annotations;
  }
};

export const PROGRESS_COMPLETE = "Congratulations, you have finished the task!";

export const progressFromContext = (ctx: DocContext): string => {
  const documentIds = Object.keys(ctx.userResponses);
  const total = documentIds.length;
  let numCompleted = documentIds.length;
  for (const docId of documentIds) {
    const currentTopics = ctx.userResponses[docId];
    const topicIds = Object.keys(currentTopics);
    let topicFailed = false;
    for (const topicId of topicIds) {
      if (topicFailed) {
        break;
      }
      const curResponses = ctx.userResponses[docId][topicId];
      const responseIds = Object.keys(curResponses);
      for (const responseId of responseIds) {
        const res = ctx.userResponses[docId][topicId][responseId];
        if (res === null) {
          --numCompleted;
          topicFailed = true;
          break;
        }
      }
    }
  }
  if (total === numCompleted) return PROGRESS_COMPLETE;
  return `${numCompleted}/${total} documents analyzed.`;
};

export const AdobeDocProvider = (props: AdobeDocProviderProps) => {
  const apisRef = React.useRef<AdobeApiHandler | null>(null);
  const [state, setState] = React.useState<DocumentState>("LOADING");
  const setDocument = setState as React.Dispatch<
    React.SetStateAction<DocContext>
  >;
  React.useEffect(() => {
    const getDocuments = async () => {
      try {
        const rawDocuments = await fetchDocuments();
        const userName = window.location.pathname.split("/").pop() || "";
        const documents = findRelevantDocuments(userName, rawDocuments);
        setState({
          apis: apisRef,
          documents,
          selectedDocument: null,
          selectedTopic: null,
          selectedAnnotation: null,
          currentPage: 1,
          selectedTab: "HIGHLIGHTS",
          userResponses: userResponsesFromDocuments(documents),
          missingAnnotations: new Set(),
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

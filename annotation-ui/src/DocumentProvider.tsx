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

interface HasId {
  id: string;
  [otherVar: string | number]: any;
}

interface Document {
  pdf_url: string;
  title: string;
  question: string;
  extract_api: any;
}

type DocumentId = string;

type DocumentCollection = Record<DocumentId, Document>;

const fetchDocuments = async (): Promise<DocumentCollection> => {
  const res = await window.fetch("/api/v1/documents", { method: "GET" });
  return res.json();
};

interface DocContext {
  documents: DocumentCollection;
  selectedDocument: DocumentId | null;
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
          currentPage: 1,
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

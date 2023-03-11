import React from "react";

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

interface Topic {
  name: string;
  annotations: Array<object>;
}

interface Document {
  pdf_url: string;
  title: string;
  topics: Topic[];
}

interface DocContext {
  documents: Document[];
  apis: React.MutableRefObject<AdobeApiHandler | null>;
}

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
  const { children } = props;
  return (
    <AdobeDocContext.Provider value={{ apis: apisRef, documents: [] }}>
      {children}
    </AdobeDocContext.Provider>
  );
};

import React from "react";
import { Loading } from "../../components/Loading";
import { FatalApiError } from "../../components/FatalApiError";
import assignments from "../../assignments.json";

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
  const week: string | null = new URLSearchParams(window.location.search).get(
    "week"
  );
  const res = await window.fetch(
    `/api/v1/documents${week ? `?week=${week}` : ""}`,
    { method: "GET" }
  );
  const result = await res.json();
  return result;
};

export interface DocContext {
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

const getLocalStorageKey = (): string => {
};

export const saveToLocalStorage = (ctx: DocContext) => {
};

export const readFromLocalStorage = (): UserResponses | null => {
};

export const March13Provider = (props: AdobeDocProviderProps) => {
};

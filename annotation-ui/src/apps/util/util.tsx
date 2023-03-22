import React from "react";
import { Loading } from "../../components/Loading";
import { FatalApiError } from "../../components/FatalApiError";

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

export interface ApiObject {
  current: AdobeApiHandler | null;
}

export const apis: ApiObject = { current: null };

const getLocalStorageKey = (): string => {
  const user_name = window.location.pathname.split("/").pop() || "";
  const week = new URLSearchParams(window.location.search).get("week") || "";
  if (week === null) {
    return user_name;
  }
  return `${user_name}&${week}`;
};

interface HasUserResponses {
  userResponses: object;
  [x: string | number]: any;
}

export const saveToLocalStorage = (hasUserResponses: HasUserResponses) => {
  const key = getLocalStorageKey();
  const user_name = window.location.pathname.split("/").pop() || "";
  const responses = { user_name, annotations: hasUserResponses.userResponses };
  window.localStorage.setItem(key, JSON.stringify(responses));
};

export function readFromLocalStorage<T>(): T | null {
  const key = getLocalStorageKey();
  const data = window.localStorage.getItem(key);
  if (typeof data === "string") {
    return JSON.parse(data).annotations as T;
  }
  return null;
}

export type GenericDocumentCollection<T> = Record<string, T>;

export async function fetchDocuments<T>(): Promise<
  GenericDocumentCollection<T>
> {
  const week: string | null = new URLSearchParams(window.location.search).get(
    "week"
  );
  const res = await window.fetch(
    `/api/v1/documents${week ? `?week=${week}` : ""}`,
    { method: "GET" }
  );
  const result = await res.json();
  return result;
}

interface ProviderProps {
  children: React.ReactNode;
}

export type EffectThunk<T> = (
  setState: React.Dispatch<React.SetStateAction<"LOADING" | "ERROR" | T>>
) => () => void;

export function generateProviders<T>(effectThunk: EffectThunk<T>) {
  const ValueContext = React.createContext<T | null>(null);

  const UpdateValueContext = React.createContext<React.Dispatch<
    React.SetStateAction<T>
  > | null>(null);

  const useSetValue = () => {
    const ctx = React.useContext(UpdateValueContext);
    if (ctx === null) {
      throw new Error("Please use the setAdobeDoc inside of its provider.");
    }
    return ctx;
  };

  const useValue = (): T => {
    const ctx = React.useContext(ValueContext);
    if (ctx === null) {
      throw new Error(
        "Please use useAdobeWeek20Context inside of its provider."
      );
    }
    return ctx;
  };

  const Provider = (props: ProviderProps) => {
    const { children } = props;
    const [state, setState] = React.useState<"LOADING" | "ERROR" | T>(
      "LOADING"
    );
    const effect = React.useMemo(() => {
      return effectThunk(setState);
    }, [setState]);
    React.useEffect(effect, [effect]);
    switch (state) {
      case "LOADING": {
        return <Loading />;
      }
      case "ERROR": {
        return <FatalApiError />;
      }
      default: {
        return (
          <UpdateValueContext.Provider
            value={setState as React.Dispatch<React.SetStateAction<T>>}
          >
            <ValueContext.Provider value={state as T}>
              {children}
            </ValueContext.Provider>
          </UpdateValueContext.Provider>
        );
      }
    }
  };
  return { Provider, useValue, useSetValue };
}

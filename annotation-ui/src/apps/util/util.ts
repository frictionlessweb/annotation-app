declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AdobeDC?: any;
  }
}

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

export const readFromLocalStorage = <T>(): T | null => {
  const key = getLocalStorageKey();
  const data = window.localStorage.getItem(key);
  if (typeof data === "string") {
    return JSON.parse(data).annotations as T;
  }
  return null;
};

export const fetchDocuments = async <T>(): Promise<T> => {
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

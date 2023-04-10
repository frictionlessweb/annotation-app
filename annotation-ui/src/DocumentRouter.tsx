import React from "react";
import { DocumentFetcher } from "./context";
import { DocumentForm } from "./tasks/DocumentForm";

export const DocumentRouter = () => {
  return (
    <DocumentFetcher>
      <DocumentForm />
    </DocumentFetcher>
  );
};

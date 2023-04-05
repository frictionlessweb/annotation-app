import React from "react";
import { Flex, Text } from "@adobe/react-spectrum";
import { Loading } from "../src/components/Loading";
import { FatalApiError } from "../src/components/FatalApiError";
import { DocumentFetcher, useDocumentContext } from "./context";
import { DocumentForm } from './tasks/DocumentForm';

export const DocumentRouter = () => {
  return (
    <DocumentFetcher>
      <DocumentForm />
    </DocumentFetcher>
  );
};

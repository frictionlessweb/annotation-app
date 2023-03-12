import React from "react";
import { Flex, Picker, Item, Text, Heading } from "@adobe/react-spectrum";
import { useAdobeDocContext, useSetAdobeDoc } from "./DocumentProvider";

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
  enableAnnotationAPIs: true,
  includePDFAnnotations: true,
} as const;

const PDF = () => {
  const { selectedDocument, documents, apis } = useAdobeDocContext();
  const url: string = selectedDocument
    ? documents[selectedDocument]?.pdf_url
    : "";
  const name: string = selectedDocument
    ? documents[selectedDocument]?.title
    : "";
  React.useEffect(() => {
    const render = async () => {
      const view = new window.AdobeDC.View({
        clientId: process.env.VITE_PUBLIC_ADOBE_CLIENT_ID,
        divId: "PDF_DOCUMENT",
      });
      const config = {
        content: {
          location: {
            url: url,
          },
        },
        metaData: {
          fileName: name,
          id: name,
        },
      };
      const preview = await view.previewFile(config, DEFAULT_VIEW_CONFIG);
      const manager = await preview.getAnnotationManager();
      const curApis = await preview.getAPIs();
      apis.current = {
        annotationApis: manager,
        locationApis: curApis,
      };
      // TODO: Insert calls to add the annotations here!
    };
    render();
  }, [url, apis]);
  return <div id="PDF_DOCUMENT" style={{ display: "absolute" }} />;
};

const AnnotationJudger = () => {
  const ctx = useAdobeDocContext();
  const { apis } = ctx;
  const annotations =
    ctx.selectedDocument === null || ctx.selectedTopic === null
      ? []
      : ctx.documents[ctx.selectedDocument].topics[ctx.selectedTopic];
  if (annotations.length <= 0) {
    return <Text>No annotations for this document and topic.</Text>;
  }
  return (
    <Flex direction="column">
      <Heading level={3}>Annotations</Heading>
      {annotations.map((annotation) => {
        const page = annotation?.target?.selector?.node?.index + 1;
        return (
          <p
            key={annotation.id}
            style={{
              margin: 0,
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => {
              if (apis.current === null) return;
              apis.current?.locationApis.gotoLocation(page, 0, 0);
            }}
          >
            Page {page} - Annotation {annotation.id}
          </p>
        );
      })}
    </Flex>
  );
};

const DocumentPickers = () => {
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  return (
    <Flex marginBottom="16px">
      <Picker
        marginEnd="16px"
        label="Select a Document"
        onSelectionChange={(key) => {
          setDoc((prev) => {
            return {
              ...prev,
              selectedDocument: key as string,
              selectedTopic: null,
            };
          });
        }}
      >
        {Object.keys(ctx.documents).map((doc) => {
          return <Item key={doc}>{doc}</Item>;
        })}
      </Picker>
      <Picker
        label="Select a Topic"
        isDisabled={ctx.selectedDocument === null}
        onSelectionChange={(key) => {
          setDoc((prev) => {
            return {
              ...prev,
              selectedTopic: key as string,
            };
          });
        }}
      >
        {ctx.selectedDocument === null
          ? []
          : Object.keys(ctx.documents[ctx.selectedDocument].topics).map(
              (topic) => {
                return <Item key={topic}>{topic}</Item>;
              }
            )}
      </Picker>
    </Flex>
  );
};

const PDFDocument = () => {
  const ctx = useAdobeDocContext();
  if (ctx.selectedDocument === null || ctx.selectedTopic === null) {
    return <Text>Please select a document and a topic before proceeding.</Text>;
  }
  return <PDF />;
};

export const Annotations = () => {
  return (
    <Flex
      direction="column"
      marginX="32px"
      UNSAFE_style={{ paddingTop: "16px", paddingBottom: "16px" }}
    >
      <DocumentPickers />
      <Flex width="100%">
        <Flex width="50%" position="relative" height="500px" marginEnd="16px">
          <PDFDocument />
        </Flex>
        <Flex width="50%" marginStart="16px">
          <AnnotationJudger />
        </Flex>
      </Flex>
    </Flex>
  );
};

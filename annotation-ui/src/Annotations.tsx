import React from "react";
import { Flex, Picker, Item, Text, Heading } from "@adobe/react-spectrum";
import { useAdobeDocContext, useSetAdobeDoc } from "./DocumentProvider";
import { ToastQueue } from "@react-spectrum/toast";

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
  enableAnnotationAPIs: true,
  includePDFAnnotations: true,
} as const;

const PDF_ID = "PDF_DOCUMENT";

const AnnotationCollection = () => {
  return (
    <Flex direction="column">
      <Heading level={3}>Annotations</Heading>
    </Flex>
  );
};

interface AdobePageEvent {
  type: "PAGE_VIEW";
  data: { pageNumber: number };
}

interface AdobeEvent {
  type: string;
  data: unknown;
}

const Instructions = () => {
  return (
    <Flex justifyContent="center" marginStart="16px" direction="column">
      <p>Hi</p>
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
        onSelectionChange={async (key) => {
          const { apis } = ctx;
          const { pdf_url: url, title } = ctx.documents[key];
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
              fileName: title,
              id: title,
            },
          };
          const preview = await view.previewFile(config, DEFAULT_VIEW_CONFIG);
          await view.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
            (event: AdobePageEvent | AdobeEvent) => {
              if (event.type !== "PAGE_VIEW") return;
              const pageEvent = event as AdobePageEvent;
              setDoc((prevDoc) => {
                return {
                  ...prevDoc,
                  currentPage: pageEvent.data.pageNumber,
                };
              });
            },
            { enablePDFAnalytics: true }
          );
          const [manager, curApis] = await Promise.all([
            preview.getAnnotationManager(),
            preview.getAPIs(),
          ]);
          apis.current = {
            annotationApis: manager,
            locationApis: curApis,
          };
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
      <Instructions />
    </Flex>
  );
};

export const Annotations = () => {
  const pdfRef = React.useRef<HTMLDivElement | null>(null);
  const { selectedDocument } = useAdobeDocContext();
  return (
    <Flex
      direction="column"
      marginX="32px"
      UNSAFE_style={{ paddingTop: "16px", paddingBottom: "16px" }}
    >
      <DocumentPickers />
      <Flex width="100%">
        <Flex
          width="75%"
          position="relative"
          height={window.innerHeight}
          marginEnd="16px"
        >
          <div
            ref={pdfRef}
            id={PDF_ID}
            style={{ position: "absolute", zIndex: 2 }}
          />
          <div style={{ position: "absolute", zIndex: 1 }}>
            {selectedDocument === null && (
              <Text>Please select a document to view a PDF.</Text>
            )}
          </div>
        </Flex>
        <Flex width="25%" marginStart="16px">
          <AnnotationCollection />
        </Flex>
      </Flex>
    </Flex>
  );
};

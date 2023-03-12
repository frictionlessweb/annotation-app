import React from "react";
import {
  Flex,
  Picker,
  Item,
  Text,
  Heading,
  RadioGroup,
  Radio,
  Button,
} from "@adobe/react-spectrum";
import {
  useAdobeDocContext,
  useSetAdobeDoc,
  annotationsComplete,
} from "./DocumentProvider";
import ThumbsUp from "@spectrum-icons/workflow/ThumbUpOutline";
import ThumbsDown from "@spectrum-icons/workflow/ThumbDownOutline";

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
  enableAnnotationAPIs: true,
  includePDFAnnotations: true,
} as const;

const PDF_ID = "PDF_DOCUMENT";

const AnnotationJudger = () => {
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const { apis, currentPage } = ctx;
  const annotations =
    ctx.selectedDocument === null || ctx.selectedTopic === null
      ? []
      : ctx.documents[ctx.selectedDocument].topics[ctx.selectedTopic];
  if (annotations.length <= 0) {
    return <Text>No annotations for this document and topic.</Text>;
  }
  const currentResponses =
    ctx.annotationResponses?.[ctx.selectedDocument as string]?.[
      ctx.selectedTopic as string
    ];

  const isSaveDisabled =
    !currentResponses || !annotationsComplete(currentResponses);
  return (
    <Flex direction="column">
      <Heading level={3}>Annotations</Heading>
      {annotations.map((annotation) => {
        const page = annotation?.target?.selector?.node?.index + 1;
        if (ctx.selectedDocument === null || ctx.selectedTopic === null)
          return null;
        const initVal =
          ctx.annotationResponses[ctx.selectedDocument][ctx.selectedTopic][
            annotation.id
          ];
        const currentValue = (() => {
          switch (initVal) {
            case true:
              return "true";
            case false:
              return "false";
            default:
              return "";
          }
        })();
        return (
          <div
            key={annotation.id}
            style={{
              border: "2px solid grey",
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "8px",
            }}
          >
            <p
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
            <RadioGroup
              isDisabled={page !== currentPage}
              label="Relevant?"
              orientation="horizontal"
              value={currentValue}
              onChange={(value) => {
                const newValue = value === "true" ? true : false;
                setDoc((prevDoc) => {
                  if (
                    prevDoc.selectedDocument === null ||
                    prevDoc.selectedTopic === null
                  )
                    return prevDoc;
                  const newDoc = {
                    ...prevDoc,
                  };
                  newDoc.annotationResponses[prevDoc.selectedDocument][
                    prevDoc.selectedTopic
                  ][annotation.id] = newValue;
                  return newDoc;
                });
              }}
            >
              <Radio key="true" value="true">
                <ThumbsUp />
              </Radio>
              <Radio key="false" value="false">
                <ThumbsDown />
              </Radio>
            </RadioGroup>
          </div>
        );
      })}
      <Flex>
        <Button isDisabled={isSaveDisabled} variant="primary">
          Save
        </Button>
      </Flex>
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
      <Picker
        label="Select a Topic"
        isDisabled={ctx.selectedDocument === null}
        onSelectionChange={async (key) => {
          const { apis, selectedDocument } = ctx;
          if (selectedDocument === null) return;
          setDoc((prev) => {
            return {
              ...prev,
              selectedTopic: key as string,
            };
          });
          await apis.current?.annotationApis.removeAnnotationsFromPDF();
          const annotations =
            ctx.documents[selectedDocument].topics[key as string];
          await apis.current?.annotationApis.addAnnotations(annotations);
          await apis.current?.locationApis.gotoLocation(1, 0, 0);
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
        <Flex width="50%" position="relative" height="500px" marginEnd="16px">
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
        <Flex width="50%" marginStart="16px">
          <AnnotationJudger />
        </Flex>
      </Flex>
    </Flex>
  );
};

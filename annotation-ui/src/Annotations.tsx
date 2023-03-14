import React from "react";
import {
  Flex,
  Picker,
  Item,
  Text,
  Heading,
  ActionGroup,
  View,
} from "@adobe/react-spectrum";
import {
  useAdobeDocContext,
  useSetAdobeDoc,
  messageFromDocContext,
  HasId,
} from "./DocumentProvider";
import ThumbsUp from "@spectrum-icons/workflow/ThumbUpOutline";
import ThumbsDown from "@spectrum-icons/workflow/ThumbDownOutline";
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

const sortAnnotations = (a: HasId, b: HasId): number => {
  const aPage: number = a?.target?.selector?.node?.index;
  const bPage: number = b?.target?.selector?.node?.index;
  return aPage < bPage ? -1 : 1;
};

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
  return (
    <Flex direction="column">
      <Heading level={3} marginBottom="size-10">
        Annotations
      </Heading>

      <p>Reminder instructions will go here</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
        }}
      >
        {annotations.sort(sortAnnotations).map((annotation) => {
          const page = annotation?.target?.selector?.node?.index + 1;
          const isSelected = currentPage === page;
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
            <div key={annotation.id}>
              <ul
                className="annotations-container"
                style={{
                  listStyleType: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                <li
                  id={annotation.id}
                  onClick={() => {
                    if (apis.current === null) return;
                    apis.current?.locationApis.gotoLocation(page, 0, 0);
                  }}
                >
                  <View
                    paddingX="size-100"
                    paddingY="size-25"
                    marginBottom="size-160"
                    borderStartColor={isSelected ? "chartreuse-400" : undefined}
                    borderStartWidth={isSelected ? "thick" : undefined}
                  >
                    <p>
                      Annotation {annotation.id}
                      {/* TODO: can replace with actual annot bodyValue? */}
                    </p>
                    <p>
                      <small>Page {page}</small>
                    </p>
                    {isSelected && (
                      <ActionGroup
                        isQuiet
                        selectionMode="single"
                        selectedKeys={[currentValue]}
                        onAction={(key) => {
                          const newValue = key === "true" ? true : false;
                          setDoc((prevDoc) => {
                            if (
                              prevDoc.selectedDocument === null ||
                              prevDoc.selectedTopic === null
                            )
                              return prevDoc;
                            const newDoc = {
                              ...prevDoc,
                            };
                            newDoc.annotationResponses[
                              prevDoc.selectedDocument
                            ][prevDoc.selectedTopic][annotation.id] = newValue;
                            return newDoc;
                          });
                        }}
                      >
                        <Item key="true">
                          <ThumbsUp />
                        </Item>
                        <Item key="false">
                          <ThumbsDown />
                        </Item>
                      </ActionGroup>
                    )}
                  </View>
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </Flex>
  );
};

interface AdobePageEvent {
  type: "PAGE_VIEW";
  data: { pageNumber: number };
}

interface AdobeAnnotationAddedEvent {
  type: "ANNOTATION_ADDED";
  data: { id: string };
}

interface AdobeAnnotationDeletedEvent {
  type: "ANNOTATION_DELETED";
  data: { id: string };
}

interface AdobeEvent {
  type: string;
  data: unknown;
}

const Suggestions = () => {
  const ctx = useAdobeDocContext();
  const message = messageFromDocContext(ctx);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => {
    const handleMessageChange = async () => {
      if (saved || Array.isArray(message)) return;
      try {
        const user_name = window.location.pathname.split("/").pop();
        const annotations = ctx.annotationResponses;
        const requestBodyObject = { user_name, annotations };
        const body = JSON.stringify(requestBodyObject);
        const res = await window.fetch("/api/v1/save-session", {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          ToastQueue.positive("Saved progress successfully.", {
            timeout: 10,
          });
          setSaved(true);
        } else {
          throw new Error("REQUEST_FAILED");
        }
      } catch (err) {
        ToastQueue.negative(
          "An error occurred. Please refresh the page and try again.",
          { timeout: 10 }
        );
      }
    };
    handleMessageChange();
  }, [message, ctx]);
  return (
    <Flex justifyContent="center" marginStart="16px" direction="column">
      {Array.isArray(message) ? (
        <>
          <Text marginY={0}>Please judge these annotations: </Text>
          <ul style={{ margin: 0 }}>
            {message.map((msg) => {
              return <li key={msg}>{msg}</li>;
            })}
          </ul>
        </>
      ) : (
        <Text>{message}</Text>
      )}
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
            (event: AdobeEvent) => {
              switch (event.type) {
                case "PAGE_VIEW": {
                  const pageEvent = event as AdobePageEvent;
                  setDoc((prevDoc) => {
                    return {
                      ...prevDoc,
                      currentPage: pageEvent.data.pageNumber,
                    };
                  });
                  return;
                }
                case "ANNOTATION_ADDED": {
                  const annotationAdded = event as AdobeAnnotationAddedEvent;
                  setDoc((prevDoc) => {
                    const { selectedDocument, selectedTopic } = prevDoc;
                    if (selectedDocument === null || selectedTopic === null)
                      return prevDoc;
                    const { id } = annotationAdded.data;
                    const existingTopics =
                      prevDoc.annotationResponses[selectedDocument][
                        selectedTopic
                      ];
                    if (id in existingTopics) return prevDoc;
                    const newDoc = { ...prevDoc };
                    newDoc.documents[selectedDocument].topics[
                      selectedTopic
                    ].push(annotationAdded.data);
                    newDoc.annotationResponses[selectedDocument][selectedTopic][
                      id
                    ] = null;
                    return newDoc;
                  });
                  return;
                }
                case "ANNOTATION_DELETED": {
                  const annotationDeleted =
                    event as AdobeAnnotationDeletedEvent;
                  setDoc((prevDoc) => {
                    const { selectedDocument, selectedTopic } = prevDoc;
                    if (selectedDocument === null || selectedTopic === null)
                      return prevDoc;
                    const { id } = annotationDeleted.data;
                    const newDoc = { ...prevDoc };
                    const withoutAnnotation = newDoc.documents[
                      selectedDocument
                    ].topics[selectedTopic].filter((x) => x.id !== id);
                    newDoc.documents[selectedDocument].topics[selectedTopic] =
                      withoutAnnotation;
                    delete newDoc.annotationResponses[selectedDocument][
                      selectedTopic
                    ][id];
                    return newDoc;
                  });
                  return;
                }
                default: {
                  return;
                }
              }
            },
            { enablePDFAnalytics: true, enableAnnotationEvents: true }
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
      <Suggestions />
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
        <Flex width="75%" position="relative" height="500px" marginEnd="16px">
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
          <AnnotationJudger />
        </Flex>
      </Flex>
    </Flex>
  );
};

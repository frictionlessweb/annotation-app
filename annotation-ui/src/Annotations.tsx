import React from "react";
import {
  Flex,
  Picker,
  Tabs,
  TabList,
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
  VIEW_TAB,
  ApiAnnotation,
  HasId,
} from "./DocumentProvider";
import ThumbsUp from "@spectrum-icons/workflow/ThumbUpOutline";
import ThumbsDown from "@spectrum-icons/workflow/ThumbDownOutline";
import { ToastQueue } from "@react-spectrum/toast";
import produce from "immer";

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
  enableAnnotationAPIs: true,
  includePDFAnnotations: true,
  showCommentsPanel: false,
  showToolsOnTextSelection: false,
} as const;

const PDF_ID = "PDF_DOCUMENT";

const sortAnnotations = (a: ApiAnnotation, b: ApiAnnotation): number => {
  const aPage: number = a?.annotation.target?.selector?.node?.index;
  const bPage: number = b?.annotation?.selector?.node?.index;
  return aPage < bPage ? -1 : 1;
};

const Highlights = () => {
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const { apis } = ctx;
  const annotations =
    ctx.selectedDocument === null || ctx.selectedTopic === null
      ? []
      : ctx.documents[ctx.selectedDocument].topics[ctx.selectedTopic];
  return (
    <>
      <p>Reminder instructions will go here</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
          maxHeight: "550px",
        }}
      >
        {[...annotations].sort(sortAnnotations).map((annotation) => {
          const page = annotation?.annotation.target?.selector?.node?.index + 1;
          const isSelected =
            ctx.selectedAnnotation === annotation.annotation.id;
          if (ctx.selectedDocument === null || ctx.selectedTopic === null)
            return null;
          const initVal =
            ctx.annotationResponses[ctx.selectedDocument][ctx.selectedTopic][
              annotation.annotation.id
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
            <div key={annotation.annotation.id}>
              <ul
                className="annotations-container"
                style={{
                  listStyleType: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                <li
                  id={annotation.annotation.id}
                  onClick={() => {
                    if (apis.current === null) return;
                    apis.current?.locationApis.gotoLocation(page, 0, 0);
                    setDoc((prevDoc) => {
                      return {
                        ...prevDoc,
                        selectedAnnotation: annotation.annotation.id,
                      };
                    });
                  }}
                >
                  <View
                    paddingX="size-100"
                    paddingY="size-25"
                    marginBottom="size-160"
                    borderStartColor={isSelected ? "chartreuse-400" : undefined}
                    borderStartWidth={isSelected ? "thick" : undefined}
                  >
                    <Flex
                      width="100%"
                      justifyContent="space-between"
                      alignItems="end"
                    >
                      <Flex direction="column">
                        <p style={{ margin: 0 }}>
                          Annotation {annotation.annotation.id}
                        </p>
                        <p style={{ marginTop: 0 }}>
                          <small>Page {page}</small>
                        </p>
                        <p style={{ margin: 0 }}>
                          <small>{annotation.text}</small>
                        </p>
                      </Flex>
                      {currentValue === "true" && <ThumbsUp />}
                      {currentValue === "false" && <ThumbsDown />}
                    </Flex>
                    {isSelected && (
                      <ActionGroup
                        isQuiet
                        selectionMode="single"
                        selectedKeys={[currentValue]}
                        onAction={(key) => {
                          const newValue = key === "true" ? true : false;
                          setDoc((prevDoc) => {
                            return produce(prevDoc, (newDoc) => {
                              if (
                                prevDoc.selectedDocument === null ||
                                prevDoc.selectedTopic === null
                              )
                                return prevDoc;
                              newDoc.annotationResponses[
                                prevDoc.selectedDocument
                              ][prevDoc.selectedTopic][
                                annotation.annotation.id
                              ] = newValue;
                            });
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
    </>
  );
};

const TopicSpecificHighlights = () => {
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const { apis } = ctx;
  const annotations =
    ctx.selectedDocument === null || ctx.selectedTopic === null
      ? []
      : ctx.userAnnotations[ctx.selectedDocument][ctx.selectedTopic];
  return (
    <Flex direction="column" marginTop="16px">
      <Text>You have not created any annotations.</Text>
    </Flex>
  );
};

const AnnotationJudger = () => {
  const ctx = useAdobeDocContext();
  const { selectedTab: tab } = ctx;
  const setDoc = useSetAdobeDoc();
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
        Reviewing Tasks
      </Heading>
      <Tabs
        aria-label="Annotations"
        selectedKey={ctx.selectedTab}
        onSelectionChange={(key) => {
          setDoc((prevDoc) => {
            return {
              ...prevDoc,
              selectedTab: key as VIEW_TAB,
            };
          });
        }}
      >
        <TabList>
          <Item key="HIGHLIGHTS">Highlights</Item>
          <Item key="ATTRIBUTIONS">Attributions</Item>
        </TabList>
      </Tabs>
      {tab === "HIGHLIGHTS" && <Highlights />}
      {tab === "ATTRIBUTIONS" && <TopicSpecificHighlights />}
    </Flex>
  );
};

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
          const element = document.createElement("a");
          const textFile = new Blob([JSON.stringify(requestBodyObject)], {
            type: "text/plain",
          });
          element.href = URL.createObjectURL(textFile);
          element.download = "annotations.json";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
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
  }, [message, ctx, saved]);
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

interface AdobeEvent {
  type: string;
  data: unknown;
}

interface AdobePageEvent {
  type: "PAGE_VIEW";
  data: HasId;
}

interface AdobeAnnotationSelectedEvent {
  type: "ANNOTATION_SELECTED";
  data: HasId;
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
                case "ANNOTATION_SELECTED": {
                  const annotationSelected =
                    event as AdobeAnnotationSelectedEvent;
                  setDoc((prevDoc) => {
                    return produce(prevDoc, (draft) => {
                      const { id } = annotationSelected.data;
                      draft.selectedAnnotation = id;
                      if (
                        draft.selectedTab === null ||
                        draft.selectedDocument === null ||
                        draft.selectedTopic === null
                      )
                        return;
                      draft.selectedAnnotation = id;
                      const taskIds = new Set(
                        draft.documents[draft.selectedDocument].topics[
                          draft.selectedTopic
                        ].map((x) => x.annotation.id)
                      );
                      const isTaskId = taskIds.has(id);
                      const isInActiveTab = isTaskId
                        ? draft.selectedTab === "HIGHLIGHTS"
                        : draft.selectedTab === "ATTRIBUTIONS";
                      if (isInActiveTab) return;
                      draft.selectedTab =
                        draft.selectedTab === "HIGHLIGHTS"
                          ? "ATTRIBUTIONS"
                          : "HIGHLIGHTS";
                    });
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
          setDoc((prev) => {
            return {
              ...prev,
              selectedDocument: key as string,
              selectedTopic: null,
              apis: {
                current: {
                  annotationApis: manager,
                  locationApis: curApis,
                },
              },
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
          const apiAnnotations =
            ctx.documents[selectedDocument].topics[key as string];
          const annotations = apiAnnotations.map(
            (annotation) => annotation.annotation
          );
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
      UNSAFE_style={{
        paddingTop: "16px",
        paddingBottom: "16px",
      }}
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
          <AnnotationJudger />
        </Flex>
      </Flex>
    </Flex>
  );
};

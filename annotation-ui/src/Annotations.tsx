import React from "react";
import {
  Flex,
  Button,
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
  HasId,
  topicsFromDocument,
  annotationsFromContext,
  tabFromAnnotationId,
  tabFromTopic,
  DocContext,
  progressFromContext,
  PROGRESS_COMPLETE,
  saveToLocalStorage,
} from "./DocumentProvider";
import ThumbsUp from "@spectrum-icons/workflow/ThumbUpOutline";
import ThumbsDown from "@spectrum-icons/workflow/ThumbDownOutline";
import Alert from "@spectrum-icons/workflow/Alert";
import { ToastQueue } from "@react-spectrum/toast";
import produce from "immer";

const PDF_ID = "PDF_DOCUMENT";

function partition<T>(
  elements: Array<T>,
  predicate: (el: T) => boolean
): [Array<T>, Array<T>] {
  const yes: Array<T> = [];
  const no: Array<T> = [];
  for (const element of elements) {
    if (predicate(element)) {
      yes.push(element);
    } else {
      no.push(element);
    }
  }
  return [yes, no];
}

const selectTopic = async (
  setDoc: React.Dispatch<React.SetStateAction<DocContext>>,
  key: string,
  ctx: DocContext
) => {
  if (ctx.selectedDocument === null) return;
  const { selectedDocument, apis } = ctx;
  await apis.current?.annotationApis.removeAnnotationsFromPDF();
  const apiAnnotations = annotationsFromContext({
    ...ctx,
    selectedTopic: key as string,
  });
  const annotations = apiAnnotations.map((annotation) => annotation.annotation);
  const [annotationsInDocument, annotationsOutsideDocument] = partition(
    annotations,
    (annotation) => {
      return annotation?.target?.source !== undefined;
    }
  );
  const missingAnnotations = new Set<string>(
    annotationsOutsideDocument.map((x) => x.id)
  );
  try {
    await apis.current?.annotationApis.addAnnotations(annotationsInDocument);
    await apis.current?.locationApis.gotoLocation(1, 0, 0);
  } catch (err) {
    console.log(err);
  }
  setDoc((prev) => {
    return {
      ...prev,
      selectedTopic: key as string,
      selectedTab: tabFromTopic(key as string, ctx.documents[selectedDocument]),
      missingAnnotations,
    };
  });
};

const Instructions = () => {
  const ctx = useAdobeDocContext();
  if (ctx.selectedTopic === null || ctx.selectedDocument === null) {
    return null;
  }
  if (ctx.selectedTopic === "Generic Highlights") {
    return (
      <Text>
        Does each highlight convey important information about the document?
      </Text>
    );
  }
  const tab = tabFromTopic(
    ctx.selectedTopic,
    ctx.documents[ctx.selectedDocument]
  );
  if (tab === "HIGHLIGHTS") {
    return (
      <Text>
        Does each highlight convey important information about the <b>topic</b>{" "}
        in the document?
      </Text>
    );
  }
  const { statement } =
    ctx.documents[ctx.selectedDocument].attributions[ctx.selectedTopic];
  return (
    <>
      <Text marginBottom="16px">
        Does each highlight overlap with the statement?
      </Text>
      <Text>
        {'"'}
        {statement}
        {'"'}
      </Text>
    </>
  );
};

const Highlights = () => {
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const { apis } = ctx;
  const annotations = annotationsFromContext(ctx);
  return (
    <>
      <Flex marginY="16px" direction="column">
        <Instructions />
      </Flex>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
          maxHeight: "550px",
          maxWidth: "400px",
        }}
      >
        {[...annotations].map((annotation) => {
          const page = annotation?.annotation.target?.selector?.node?.index + 1;
          const isSelected =
            ctx.selectedAnnotation === annotation.annotation.id;
          if (ctx.selectedDocument === null || ctx.selectedTopic === null)
            return null;
          const initVal =
            ctx.userResponses[ctx.selectedDocument][ctx.selectedTopic][
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
          const isMissing = ctx.missingAnnotations.has(
            annotation.annotation.id
          );
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
                  onClick={async () => {
                    if (apis.current === null) return;
                    if (ctx.currentPage !== page) {
                      apis.current?.locationApis.gotoLocation(page, 0, 0);
                    }
                    if (!isMissing) {
                      try {
                        await apis.current?.annotationApis?.selectAnnotation(
                          annotation.annotation.id
                        );
                      } catch (err) {
                        console.error(err);
                      }
                    }
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
                          <small>{annotation.text}</small>
                        </p>
                        <p style={{ marginTop: 0 }}>
                          <small>Page {page}</small>
                        </p>
                      </Flex>
                      {currentValue === "true" ? <ThumbsUp /> : null}
                      {currentValue === "false" ? <ThumbsDown /> : null}
                    </Flex>
                    {isMissing ? (
                      <Flex alignItems="center">
                        <Alert size="XS" marginEnd="8px" />
                        <Text>
                          <small>
                            We could not find this annotation in the PDF.
                          </small>
                        </Text>
                      </Flex>
                    ) : null}
                    {isSelected && (
                      <ActionGroup
                        isQuiet
                        selectionMode="single"
                        selectedKeys={[currentValue]}
                        onAction={(key) => {
                          const newValue = key === "true" ? true : false;
                          setDoc((prevDoc) => {
                            const result = produce(prevDoc, (newDoc) => {
                              if (
                                prevDoc.selectedDocument === null ||
                                prevDoc.selectedTopic === null
                              )
                                return prevDoc;
                              newDoc.userResponses[prevDoc.selectedDocument][
                                prevDoc.selectedTopic
                              ][annotation.annotation.id] = newValue;
                            });
                            saveToLocalStorage(result);
                            return result;
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

const AnnotationJudger = () => {
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const annotations = annotationsFromContext(ctx);
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
          const newTopic =
            key === "HIGHLIGHTS" ? "Generic Highlights" : "Question 1";
          selectTopic(setDoc, newTopic, ctx);
        }}
      >
        <TabList>
          <Item key="HIGHLIGHTS">Highlights</Item>
          <Item key="ATTRIBUTIONS">Attributions</Item>
        </TabList>
      </Tabs>
      <Highlights />
    </Flex>
  );
};

const downloadJson = (json: object) => {
  const element = document.createElement("a");
  const textFile = new Blob([JSON.stringify(json)], {
    type: "text/plain",
  });
  element.href = URL.createObjectURL(textFile);
  element.download = "annotations.json";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const Progress = () => {
  const ctx = useAdobeDocContext();
  const [saved, setSaved] = React.useState(false);
  const progress = progressFromContext(ctx);
  React.useEffect(() => {
    const handleMessageChange = async () => {
      if (saved || progress !== PROGRESS_COMPLETE) return;
      try {
        const user_name = window.location.pathname.split("/").pop();
        const responses = ctx.userResponses;
        const requestBodyObject = { user_name, annotations: responses };
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
          downloadJson(requestBodyObject);
          setSaved(true);
        } else {
          console.log(res);
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
  }, [ctx, progress, saved]);
  return (
    <Flex justifyContent="center" marginStart="16px" direction="column">
      <Text>{progress}</Text>
      <Flex marginTop="8px">
        <Button
          onPress={() => {
            saveToLocalStorage(ctx);
            const user_name = window.location.pathname.split("/").pop();
            downloadJson({ user_name, annotations: ctx.userResponses });
          }}
          variant="primary"
        >
          Save Progress as JSON
        </Button>
      </Flex>
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
                      draft.selectedTab = tabFromAnnotationId(
                        id,
                        ctx.documents
                      );
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
          await manager.setConfig({
            showCommentsPanel: false,
            showToolsOnTextSelection: false,
          });
          setDoc((prev) => {
            return {
              ...prev,
              selectedDocument: key as string,
              selectedTopic: "Generic Highlights",
              apis: {
                current: {
                  annotationApis: manager,
                  locationApis: curApis,
                },
              },
            };
          });
          selectTopic(setDoc, "Generic Highlights", {
            ...ctx,
            selectedDocument: key as string,
            selectedTopic: "Generic Highlights",
            apis: {
              current: {
                annotationApis: manager,
                locationApis: curApis,
              },
            },
          });
        }}
      >
        {Object.keys(ctx.documents).map((doc) => {
          return <Item key={doc}>{doc}</Item>;
        })}
      </Picker>
      <Picker
        label="Select a Topic"
        selectedKey={ctx.selectedTopic}
        isDisabled={ctx.selectedDocument === null}
        onSelectionChange={async (key) => {
          selectTopic(setDoc, key as string, ctx);
        }}
      >
        {ctx.selectedDocument === null
          ? []
          : topicsFromDocument(ctx.documents[ctx.selectedDocument]).map(
              (topic) => {
                return <Item key={topic}>{topic}</Item>;
              }
            )}
      </Picker>
      <Progress />
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

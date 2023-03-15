import React from "react";
import {
  Flex,
  Picker,
  Item,
  Text,
  Heading,
  View,
  Button,
} from "@adobe/react-spectrum";
import {
  useAdobeDocContext,
  useSetAdobeDoc,
  Annotation as AnnotationObject,
} from "./DocumentProvider";
import produce from "immer";

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
  enableAnnotationAPIs: true,
  includePDFAnnotations: true,
} as const;

const PDF_ID = "PDF_DOCUMENT";

interface AnnotationListProps {
  annotations: AnnotationObject[];
}

const sortAnnotations = (a: AnnotationObject, b: AnnotationObject): number => {
  const aPage: number = a.page;
  const bPage: number = b.page;
  return aPage < bPage ? -1 : 1;
};

const AnnotationList = (props: AnnotationListProps) => {
  const { annotations } = props;
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const { apis } = ctx;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        maxHeight: "550px",
      }}
    >
      {[...annotations].sort(sortAnnotations).map((annotation) => {
        const { page } = annotation;
        const isSelected = ctx.selectedAnnotation === annotation.id;
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
                  apis.current?.genericApis.gotoLocation(page, 0, 0);
                  setDoc((prevDoc) => {
                    return {
                      ...prevDoc,
                      selectedAnnotation: annotation.id,
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
                      <p>Annotation {annotation.id}</p>
                      <p>
                        <small>Page {page}</small>
                      </p>
                      <p>{annotation.text}</p>
                    </Flex>
                  </Flex>
                </View>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

const AnnotationRouter = () => {
  const ctx = useAdobeDocContext();
  const { selectedDocument, annotations } = ctx;
  if (selectedDocument === null) {
    return <Text>Please select a document in order to view annotations.</Text>;
  }
  const curAnnotations = annotations[selectedDocument];
  if (curAnnotations.length <= 0) {
    return <Text>Please create some annotations in order to view them.</Text>;
  }
  return <AnnotationList annotations={curAnnotations} />;
};

const AnnotationCollection = () => {
  return (
    <Flex direction="column">
      <Heading level={3}>Annotations</Heading>
      <AnnotationRouter />
    </Flex>
  );
};

interface AdobePageEvent {
  type: "PAGE_VIEW";
  data: { pageNumber: number };
}

interface Annotation {
  id: string;
  text: string;
  page: number;
}

interface AdobeAnnotationAddedEvent {
  type: "ANNOTATION_ADDED";
  data: {
    id: string;
    target: {
      selector: {
        node: {
          index: number;
        };
        quadPoints: Array<number>;
      };
    };
  };
}

interface AdobeAnnotationDeletedEvent {
  type: "ANNOTATION_DELETED";
  data: {
    id: string;
    target: {
      selector: {
        node: {
          index: number;
        };
        quadPoints: Array<number>;
      };
    };
  };
}

interface AdobeEvent {
  type: string;
  data: unknown;
}

const StageControls = () => {
  const { stage } = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const gotoNextPhase = React.useCallback(() => {
    setDoc((prevDoc) => {
      return {
        ...prevDoc,
        stage: "SUMMARIZING_THOUGHTS",
      };
    });
  }, [setDoc]);
  const gotoPreviousPharse = React.useCallback(() => {
    setDoc((prevDoc) => {
      return {
        ...prevDoc,
        stage: "CREATING_ANNOTATIONS",
      };
    });
  }, [setDoc]);
  if (stage === "CREATING_ANNOTATIONS") {
    return (
      <Flex>
        <Button onPress={gotoNextPhase} variant="primary">
          Next
        </Button>
      </Flex>
    );
  }
  return (
    <Flex>
      <Button onPress={gotoPreviousPharse} variant="primary">
        Previous
      </Button>
    </Flex>
  );
};

const Instructions = () => {
  const { documents, selectedDocument, stage } = useAdobeDocContext();
  if (selectedDocument === null) return null;
  const curDoc = documents[selectedDocument];
  if (stage === "CREATING_ANNOTATIONS") {
    return (
      <Flex justifyContent="center" marginStart="16px" direction="column">
        <Text>Consider the following question:</Text>
        <ul style={{ margin: 0 }}>
          <li style={{ margin: 0 }}>
            <b>{curDoc.question}</b>
          </li>
        </ul>
        <Text UNSAFE_style={{ maxWidth: "600px" }}>
          Highlight portions of the document that you think are relevant to it.
          When you are ready to move on to the next portion of the text, click
          next.
        </Text>
      </Flex>
    );
  }
  return (
    <Flex justifyContent="center" marginStart="16px" direction="column">
      <Text>Consider the following question:</Text>
      <ul style={{ margin: 0 }}>
        <li style={{ margin: 0 }}>
          <b>{curDoc.question}</b>
        </li>
      </ul>
      <Text UNSAFE_style={{ maxWidth: "600px" }}>
        Use your annotations to answer this question. When you are done, click
        the Save button beneath the text editor to finish the task. To go back,
        you can click the previous button.
      </Text>
    </Flex>
  );
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let CURRENT_SELECTION_TEXT = "";

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
            async (event: AdobePageEvent | AdobeEvent) => {
              switch (event.type) {
                case "PAGE_VIEW": {
                  const pageEvent = event as AdobePageEvent;
                  setDoc((prevDoc) => {
                    return {
                      ...prevDoc,
                      currentPage: pageEvent.data.pageNumber,
                    };
                  });
                  break;
                }
                case "PREVIEW_SELECTION_END": {
                  const internalApis = await preview.getAPIs();
                  /**
                   * For reasons that remain mysterious to me, the little
                   * pop up that lets you create an annotation doesn't
                   * show up unless you delay by 50 milliseconds.
                   */
                  await delay(50);
                  const res = await internalApis.getSelectedContent();
                  CURRENT_SELECTION_TEXT = res.data;
                  break;
                }
                case "ANNOTATION_ADDED": {
                  const added = event as AdobeAnnotationAddedEvent;
                  setDoc((prevDoc) => {
                    return produce(prevDoc, (draft) => {
                      if (draft.selectedDocument === null) return;
                      const newAnnotation: Annotation = {
                        id: added.data.id,
                        text: CURRENT_SELECTION_TEXT,
                        page: added.data.target.selector.node.index + 1,
                      };
                      draft.annotations[draft.selectedDocument].push(
                        newAnnotation
                      );
                      draft.selectedAnnotation = added.data.id;
                    });
                  });
                  break;
                }
                case "ANNOTATION_DELETED": {
                  const deleted = event as AdobeAnnotationDeletedEvent;
                  setDoc((prevDoc) => {
                    return produce(prevDoc, (draft) => {
                      if (draft.selectedDocument === null) return;
                      draft.annotations[draft.selectedDocument] =
                        draft.annotations[draft.selectedDocument].filter(
                          (annotation) => annotation.id !== deleted.data.id
                        );
                    });
                  });
                  break;
                }
              }
            },
            {
              enablePDFAnalytics: true,
              enableFilePreviewEvents: true,
              enableAnnotationEvents: true,
            }
          );
          const [manager, curApis] = await Promise.all([
            preview.getAnnotationManager(),
            preview.getAPIs(),
          ]);
          setDoc((prev) => {
            return {
              ...prev,
              selectedDocument: key as string,
              apis: {
                current: {
                  annotationApis: manager,
                  genericApis: curApis,
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
      <Instructions />
      <StageControls />
    </Flex>
  );
};

const QuestionResponse = () => {
  return (
    <Flex width="100%" direction="column" alignItems="center">
      <Heading level={3}>Question Response</Heading>
    </Flex>
  );
};

export const Annotations = () => {
  const pdfRef = React.useRef<HTMLDivElement | null>(null);
  const { selectedDocument, stage } = useAdobeDocContext();
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
          {stage === "SUMMARIZING_THOUGHTS" && (
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(248, 248, 248, 1)",
              }}
            >
              <QuestionResponse />
            </div>
          )}
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

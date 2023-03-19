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
import { ToastQueue } from "@react-spectrum/toast";
import {
  useAdobeDocContext,
  useSetAdobeDoc,
  Annotation as AnnotationObject,
  DocContext,
} from "./DocumentProvider";
import produce from "immer";
import Editor, { ContentEditableEvent } from "react-simple-wysiwyg";

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
  divRef: React.MutableRefObject<HTMLDivElement | null>;
}

const sortAnnotations = (a: AnnotationObject, b: AnnotationObject): number => {
  const aPage: number = a.page;
  const bPage: number = b.page;
  return aPage < bPage ? -1 : 1;
};

const AnnotationList = (props: AnnotationListProps) => {
  const { annotations, divRef } = props;
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const { apis } = ctx;
  return (
    <div
      ref={divRef}
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

interface HasDivRef {
  divRef: React.MutableRefObject<HTMLDivElement | null>;
}

const AnnotationRouter = (props: HasDivRef) => {
  const { divRef } = props;
  const ctx = useAdobeDocContext();
  const { selectedDocument, annotations } = ctx;
  if (selectedDocument === null) {
    return <Text>Please select a document in order to view annotations.</Text>;
  }
  const curAnnotations = annotations[selectedDocument];
  if (curAnnotations.length <= 0) {
    return <Text>Please create some annotations in order to view them.</Text>;
  }
  return <AnnotationList divRef={divRef} annotations={curAnnotations} />;
};

const AnnotationCollection = (props: HasDivRef) => {
  const { divRef } = props;
  return (
    <Flex direction="column">
      <Heading level={3}>Annotations</Heading>
      <AnnotationRouter divRef={divRef} />
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
  const { stage, selectedDocument } = useAdobeDocContext();
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
  if (selectedDocument === null) return null;
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
          When you are ready to move on to the next portion of the task, click
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
        the Save button beneath the text editor to finish the task or move onto
        its next portion. To go back, you can click the previous button.
      </Text>
    </Flex>
  );
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let CURRENT_SELECTION_TEXT = "";

const changeDocumentId = async (
  ctx: DocContext,
  id: string,
  setDoc: React.Dispatch<React.SetStateAction<DocContext>>,
  divRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  const { pdf_url: url, title } = ctx.documents[id];
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
              draft.annotations[draft.selectedDocument].push(newAnnotation);
              draft.selectedAnnotation = added.data.id;
            });
          });
          divRef.current?.scroll({
            top: divRef.current?.scrollHeight,
            behavior: "smooth",
          });
          break;
        }
        case "ANNOTATION_DELETED": {
          const deleted = event as AdobeAnnotationDeletedEvent;
          setDoc((prevDoc) => {
            return produce(prevDoc, (draft) => {
              if (draft.selectedDocument === null) return;
              draft.annotations[draft.selectedDocument] = draft.annotations[
                draft.selectedDocument
              ].filter((annotation) => annotation.id !== deleted.data.id);
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
      selectedDocument: id as string,
      stage: "CREATING_ANNOTATIONS",
      apis: {
        current: {
          annotationApis: manager,
          genericApis: curApis,
        },
      },
    };
  });
};

const DocumentPickers = (props: HasDivRef) => {
  const { divRef } = props;
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  return (
    <Flex marginBottom="16px">
      <Picker
        marginEnd="16px"
        label="Select a Document"
        selectedKey={ctx.selectedDocument}
        onSelectionChange={async (key) => {
          changeDocumentId(ctx, key as string, setDoc, divRef);
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

const QuestionResponse = (props: HasDivRef) => {
  const { divRef } = props;
  const ctx = useAdobeDocContext();
  const setDoc = useSetAdobeDoc();
  const updateResponse = React.useCallback(
    (e: ContentEditableEvent) => {
      setDoc((prevDoc) => {
        return produce(prevDoc, (draft) => {
          if (draft.selectedDocument === null) return;
          draft.currentResponses[draft.selectedDocument] = e.target.value;
        });
      });
    },
    [setDoc]
  );
  const { currentResponses, documents } = ctx;
  const docIds = Object.keys(documents).sort();
  const unfinishedDocuments = docIds.filter(
    (id) => currentResponses[id] === ""
  );
  const saveState = React.useCallback(async () => {
    const { currentResponses, annotations, documents } = ctx;
    if (unfinishedDocuments.length > 0) {
      const nextDoc = unfinishedDocuments[0];
      changeDocumentId(ctx, nextDoc, setDoc, divRef);
      return;
    }
    try {
      const user_name = window.location.pathname.split("/").pop();
      const requestBodyObject = {
        user_name,
        responses: {
          documents,
          annotations,
          currentResponses,
        },
      };
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
      } else {
        throw new Error("REQUEST_FAILED");
      }
    } catch (err) {
      ToastQueue.negative(
        "An error occurred. Please refresh the page and try again.",
        { timeout: 10 }
      );
    }
  }, [ctx, unfinishedDocuments, setDoc, divRef]);
  if (ctx.selectedDocument === null) return null;
  const currentResponse = ctx.currentResponses[ctx.selectedDocument];
  let buttonText = "Next Task";
  const allFinished = unfinishedDocuments.length === 0;
  const onLastDocument =
    unfinishedDocuments.length === 1 && currentResponse === "";
  if (allFinished || onLastDocument) {
    buttonText = "Save";
  }
  return (
    <Flex width="100%" direction="column" alignItems="center">
      <Flex direction="column" UNSAFE_style={{ width: "100%" }}>
        <Heading level={3}>Response</Heading>
        <Flex
          direction="column"
          UNSAFE_style={{
            backgroundColor: "white",
            width: "100%",
          }}
        >
          <Editor
            containerProps={{
              style: { resize: "vertical", minHeight: "400px", width: "100%" },
            }}
            value={currentResponse}
            onChange={updateResponse}
          />
        </Flex>
        <Flex marginTop="16px">
          <Button
            isDisabled={currentResponse === ""}
            variant="primary"
            onPress={saveState}
          >
            {buttonText}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const Annotations = () => {
  const pdfRef = React.useRef<HTMLDivElement | null>(null);
  const { selectedDocument, stage } = useAdobeDocContext();
  const divRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <Flex
      direction="column"
      marginX="32px"
      UNSAFE_style={{ paddingTop: "16px", paddingBottom: "16px" }}
    >
      <DocumentPickers divRef={divRef} />
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
              <QuestionResponse divRef={divRef} />
            </div>
          )}
          <div style={{ position: "absolute", zIndex: 1 }}>
            {selectedDocument === null && (
              <Text>Please select a document to view a PDF.</Text>
            )}
          </div>
        </Flex>
        <Flex width="25%" marginStart="16px">
          <AnnotationCollection divRef={divRef} />
        </Flex>
      </Flex>
    </Flex>
  );
};

import React from "react";
import { Flex, Text } from "@adobe/react-spectrum";
import {
  useDocumentContext,
  useSetDoc,
  GENERATED_QUESTION_ORDER,
} from "../context";
import produce from "immer";

declare global {
  interface Window {
    AdobeDC?: any;
  }
}

const PDF_ID = "PDF_ID";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let CURRENT_SELECTION_TEXT = "";

const IntroImage = () => {
  const doc = useDocumentContext();
  return (
    <img
      style={{ maxWidth: "600px", border: "1px solid grey" }}
      src={doc.image_url}
    />
  );
};

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  enableAnnotationAPIs: true,
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
  includePDFAnnotations: true,
} as const;

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

const GeneratedQuestions = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  React.useEffect(() => {
    const renderPdf = async () => {
      const view = new window.AdobeDC.View({
        clientId: "955e8a7fbf49409f88e781533a48685d",
        divId: PDF_ID,
      });
      const config = {
        content: {
          location: {
            url: doc.pdf_url,
          },
        },
        metaData: {
          fileName: "document",
          id: "1234",
        },
      };
      const preview = await view.previewFile(config, DEFAULT_VIEW_CONFIG);
      await view.registerCallback(
        window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
        async (event: AdobeEvent) => {
          switch (event.type) {
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
              setDoc((prev) => {
                const res = produce(prev, (draft) => {
                  if (typeof draft === "string") return;
                  draft.user_responses.GENERATED_QUESTIONS[
                    GENERATED_QUESTION_ORDER[
                      draft.user_responses.current_generated_question
                    ]
                  ].highlights.push(added.data);
                });
                return res;
              });
              break;
            }
            case "ANNOTATION_DELETED": {
              const deleted = event as AdobeAnnotationDeletedEvent;
              setDoc((prev) => {
                const res = produce(prev, (draft) => {
                  if (typeof draft === "string") return;
                  const { highlights } =
                    draft.user_responses.GENERATED_QUESTIONS[
                      GENERATED_QUESTION_ORDER[
                        draft.user_responses.current_generated_question
                      ]
                    ];
                  draft.user_responses.GENERATED_QUESTIONS[
                    GENERATED_QUESTION_ORDER[
                      draft.user_responses.current_generated_question
                    ]
                  ].highlights = highlights.filter(
                    (x) => x.id !== deleted.data.id
                  );
                });
                return res;
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
      const [manager, apis] = await Promise.all([
        preview.getAnnotationManager(),
        preview.getAPIs(),
      ]);
      setDoc((prev) => {
        if (typeof prev === "string") return prev;
        return {
          ...prev,
          pdfRef: { manager, apis },
        };
      });
    };
    renderPdf();
  }, [doc.pdf_url, setDoc]);
  return <div style={{ height: "700px", width: "900px" }} id={PDF_ID} />;
};

const AnswerQuality = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  React.useEffect(() => {
    const renderPdf = async () => {
      const view = new window.AdobeDC.View({
        clientId: "955e8a7fbf49409f88e781533a48685d",
        divId: PDF_ID,
      });
      const config = {
        content: {
          location: {
            url: doc.pdf_url,
          },
        },
        metaData: {
          fileName: "document",
          id: "1234",
        },
      };
      const preview = await view.previewFile(config, DEFAULT_VIEW_CONFIG);
      await Promise.all([preview.getAnnotationManager(), preview.getAPIs()]);
      setDoc((prev) => {
        if (typeof prev === "string") return prev;
        return {
          ...prev,
          pdfRef: preview,
        };
      });
    };
    renderPdf();
  }, [doc.pdf_url, setDoc]);
  return <div style={{ height: "700px", width: "900px" }} id={PDF_ID} />;
};

const IntroDocument = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  React.useEffect(() => {
    const renderPdf = async () => {
      const view = new window.AdobeDC.View({
        clientId: "955e8a7fbf49409f88e781533a48685d",
        divId: PDF_ID,
      });
      const config = {
        content: {
          location: {
            url: doc.pdf_url,
          },
        },
        metaData: {
          fileName: "document",
          id: "1234",
        },
      };
      const preview = await view.previewFile(config, DEFAULT_VIEW_CONFIG);
      await view.registerCallback(
        window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
        async (event: AdobeEvent) => {
          switch (event.type) {
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
              setDoc((prev) => {
                const res = produce(prev, (draft) => {
                  if (typeof draft === "string") return;
                  draft.user_responses.INTRO_DOCUMENT.highlights.push(
                    added.data
                  );
                });
                return res;
              });
              break;
            }
            case "ANNOTATION_DELETED": {
              const deleted = event as AdobeAnnotationDeletedEvent;
              setDoc((prev) => {
                const res = produce(prev, (draft) => {
                  if (typeof draft === "string") return;
                  const { highlights } = draft.user_responses.INTRO_DOCUMENT;
                  draft.user_responses.INTRO_DOCUMENT.highlights =
                    highlights.filter((x) => x.id !== deleted.data.id);
                });
                console.log(res);
                return res;
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
      await Promise.all([preview.getAnnotationManager(), preview.getAPIs()]);
      setDoc((prev) => {
        if (typeof prev === "string") return prev;
        return {
          ...prev,
          pdfRef: preview,
        };
      });
    };
    renderPdf();
  }, [doc.pdf_url, setDoc]);
  return <div style={{ height: "700px", width: "900px" }} id={PDF_ID} />;
};

export const PDF = () => {
  const doc = useDocumentContext();
  switch (doc.stage) {
    case "INTRO_TASK": {
      return <IntroImage />;
    }
    case "INTRO_DOCUMENT": {
      return <IntroDocument />;
    }
    case "GENERATED_QUESTIONS": {
      return <GeneratedQuestions />;
    }
    case "ANSWER_QUALITY": {
      return <AnswerQuality />;
    }
    case "SUGGESTED_QUESTIONS": {
      return null;
    }
    case "DONE": {
      return null;
    }
  }
};

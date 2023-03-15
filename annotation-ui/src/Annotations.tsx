import React from "react";
import { Flex, Picker, Item, Text, Heading } from "@adobe/react-spectrum";
import {
  useAdobeDocContext,
  useSetAdobeDoc,
  Annotation,
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
  annotations: Annotation[];
}

const AnnotationList = (props: AnnotationListProps) => {
  const { annotations } = props;
  return <p>Write this!</p>;
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
                    });
                  });
                  break;
                }
                case "ANNOTATION_DELETED": {
                  console.log(event);
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
          apis.current = {
            annotationApis: manager,
            genericApis: curApis,
          };
          setDoc((prev) => {
            return {
              ...prev,
              selectedDocument: key as string,
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

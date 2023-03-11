import React from "react";
import { Flex, Picker, Item } from "@adobe/react-spectrum";
import { AdobeDocProvider, AdobeApiHandler } from "./DocumentProvider";

const DEFAULT_VIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  showDownloadPDF: false,
  showFullScreen: false,
  showPrintPDF: false,
} as const;

const PDF = () => {
  React.useEffect(() => {
    const render = async () => {
      const view = new window.AdobeDC.View({
        clientId: import.meta.env.VITE_PUBLIC_ADOBE_CLIENT_ID,
        divId: "PDF_DOCUMENT",
      });
      const config = {
        content: {
          location: {
            url: "/01_GENZ.pdf",
          },
        },
        metaData: {
          fileName: "01_GENZ.pdf",
        },
      };
      const preview = await view.previewFile(config, DEFAULT_VIEW_CONFIG);
      const curApis: AdobeApiHandler = await preview.getAPIs();
      console.log(curApis);
    };
    render();
  }, []);
  return <div id="PDF_DOCUMENT" style={{ display: "absolute" }} />;
};

export const Annotations = () => {
  return (
    <AdobeDocProvider>
      <Flex
        direction="column"
        data-testid="ANNOTATION_APP"
        marginX="32px"
        UNSAFE_style={{ paddingTop: "16px", paddingBottom: "16px" }}
      >
        <Flex marginBottom="16px">
          <Picker label="Select a Document">
            <Item>Test</Item>
            <Item>Test2</Item>
          </Picker>
        </Flex>
        <Flex width="100%">
          <Flex width="50%" position="relative" height="500px" marginEnd="16px">
            <PDF />
          </Flex>
          <Flex width="50%" marginStart="16px">
            Test2
          </Flex>
        </Flex>
      </Flex>
    </AdobeDocProvider>
  );
};

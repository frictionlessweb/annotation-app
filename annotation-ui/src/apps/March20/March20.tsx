import React from "react";
import { Flex, Text, Picker, Tabs, TabList, Item } from "@adobe/react-spectrum";
import {
  useMarch20,
  useSetMarch20,
  SelectedTab,
  TASK_TAB_MAP,
} from "./March20Provider";
import { DEFAULT_VIEW_CONFIG } from "../util/util";

const PDF_ID = "PDF_DOCUMENT";

const Progress = () => {
  return <Text>Write me!</Text>;
};

const DocumentPickers = () => {
  const ctx = useMarch20();
  const setDoc = useSetMarch20();
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
          await view.previewFile(config, DEFAULT_VIEW_CONFIG);
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
      <Progress />
    </Flex>
  );
};

export const TaskPicker = () => {
  const ctx = useMarch20();
  const setCtx = useSetMarch20();
  return (
    <Tabs
      aria-label="Tabs"
      selectedKey={ctx.selectedTab}
      onSelectionChange={(key) => {
        setCtx((prevCtx) => {
          return {
            ...prevCtx,
            selectedTab: key as SelectedTab,
          };
        });
      }}
    >
      <TabList>
        {Object.entries(TASK_TAB_MAP).map(([key, display]) => {
          return <Item key={key}>{display.display}</Item>;
        })}
      </TabList>
    </Tabs>
  );
};

export const TaskCore = () => {
  const { documents, selectedDocument, selectedTab } = useMarch20();
  if (selectedDocument === null) {
    return null;
  }
  const curDoc = documents[selectedDocument];
  const { questions } = curDoc;
  return <h1>Write me</h1>;
};

export const Tasks = () => {
  const { selectedDocument, selectedTab } = useMarch20();
  if (selectedDocument === null) {
    return <Text>Please select a document to begin answering quesitons.</Text>;
  }
  return (
    <Flex direction="column">
      <TaskPicker />
      <Flex direction="column" marginY="16px">
        {TASK_TAB_MAP[selectedTab].instructions}
      </Flex>
      <TaskCore />
    </Flex>
  );
};

export const March20 = () => {
  const pdfRef = React.useRef<HTMLDivElement | null>(null);
  const { selectedDocument } = useMarch20();
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
        <Flex width="25%" marginStart="16px" height="100%">
          <Tasks />
        </Flex>
      </Flex>
    </Flex>
  );
};

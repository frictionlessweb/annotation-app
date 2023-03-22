import React from "react";
import {
  Flex,
  Text,
  Picker,
  Tabs,
  TabList,
  Item,
  Divider,
  Button,
  Checkbox,
} from "@adobe/react-spectrum";
import {
  useMarch20,
  useSetMarch20,
  SelectedTab,
  TASK_TAB_MAP,
  QA_ANSWERS,
  countCompletedDocuments,
} from "./March20Provider";
import ThumbsUp from "@spectrum-icons/workflow/ThumbUpOutline";
import ThumbsDown from "@spectrum-icons/workflow/ThumbDownOutline";
import produce from "immer";
import { ToastQueue } from "@react-spectrum/toast";
import { DEFAULT_VIEW_CONFIG, saveToLocalStorage } from "../util/util";

const PDF_ID = "PDF_DOCUMENT";

const Progress = () => {
  const ctx = useMarch20();
  const numDocuments = Object.keys(ctx.documents).length;
  const completedDocumentCount: number = countCompletedDocuments(ctx);
  React.useEffect(() => {
    if (completedDocumentCount === 0) return;
    try {
      ToastQueue.positive("Progress saved successfully.");
    } catch (err) {
      ToastQueue.negative(
        "An error occurred. Please refresh the page and try again."
      );
    }
  }, [completedDocumentCount]);
  return (
    <Flex alignItems="end">
      <Text>{`${countCompletedDocuments(
        ctx
      )} / ${numDocuments} documents complete.`}</Text>
    </Flex>
  );
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

export const QaTask = () => {
  const ctx = useMarch20();
  const setCtx = useSetMarch20();
  React.useEffect(() => {
    setTimeout(() => {
      setCtx((ctx) => {
        return produce(ctx, (draft) => {
          if (draft.selectedDocument === null) return;
          draft.userResponses[draft.selectedDocument].qaTask.answers[
            draft.documents[draft.selectedDocument].questions.qaTask[0].id
          ].visited = true;
        });
      });
    }, 1000);
  }, [setCtx]);
  const { selectedDocument, documents, userResponses } = ctx;
  if (selectedDocument === null) return null;
  const questions = documents[selectedDocument].questions.qaTask;
  const curIndex = userResponses[selectedDocument].qaTask.index;
  const curQuestion = questions[curIndex];
  const numCompleted = Object.values(
    userResponses[selectedDocument].qaTask.answers
  ).filter((value) => value.visited === true).length;
  const currentAnswers =
    userResponses[selectedDocument].qaTask.answers[curQuestion.id].answers;
  return (
    <Flex direction="column" marginY="16px">
      <Flex
        justifyContent="space-between"
        alignItems="center"
        marginBottom="16px"
      >
        <Flex>
          <Text>
            {numCompleted}/{questions.length} completed
          </Text>
        </Flex>
        <Flex>
          <Button
            isDisabled={curIndex === questions.length - 1}
            variant="secondary"
            marginEnd="16px"
            onPress={() => {
              setCtx((ctx) => {
                return produce(ctx, (draft) => {
                  ++draft.userResponses[selectedDocument].qaTask.index;
                  const i = draft.userResponses[selectedDocument].qaTask.index;
                  const { answers } =
                    draft.userResponses[selectedDocument].qaTask;
                  const { id } =
                    draft.documents[selectedDocument].questions.qaTask[i];
                  answers[id].visited = true;
                });
              });
            }}
          >
            Next
          </Button>
          <Button
            isDisabled={curIndex === 0}
            onPress={() => {
              setCtx((ctx) => {
                return produce(ctx, (draft) => {
                  --draft.userResponses[selectedDocument].qaTask.index;
                });
              });
            }}
            variant="secondary"
          >
            Previous
          </Button>
        </Flex>
      </Flex>
      <Flex direction="column">
        <Text UNSAFE_style={{ fontWeight: "bold" }}>Question</Text>
        <Text UNSAFE_style={{ marginBottom: "16px" }}>
          {curQuestion.question}
        </Text>
        <Text UNSAFE_style={{ fontWeight: "bold" }}>Answer</Text>
        <Text UNSAFE_style={{ marginBottom: "16px" }}>
          {curQuestion.answer}
        </Text>
        <Text UNSAFE_style={{ fontWeight: "bold" }}>Choose All That Apply</Text>
        <Flex direction="column">
          {QA_ANSWERS.map((answer) => {
            return (
              <Flex key={answer.text} alignItems="center">
                <Checkbox
                  onChange={(change) => {
                    const newCtx = produce(ctx, (draft) => {
                      if (draft.selectedDocument === null) return;
                      const { selectedDocument } = draft;
                      draft.userResponses[selectedDocument].qaTask.answers[
                        curQuestion.id
                      ].answers[answer.index] = change;
                    });
                    saveToLocalStorage(newCtx);
                    setCtx(newCtx);
                  }}
                  isSelected={currentAnswers[answer.index] === true}
                />
                <Text>{answer.text}</Text>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </Flex>
  );
};

export const TaskForTextAndId = () => {
  const ctx = useMarch20();
  const { selectedTab, selectedDocument, documents, userResponses } = ctx;
  const setCtx = useSetMarch20();
  const questionTask = TASK_TAB_MAP[selectedTab].task as
    | "topicTask"
    | "questionTask"
    | "statementsTask";
  if (selectedDocument === null) return null;
  const questions = documents[selectedDocument].questions[questionTask];
  const curIndex = userResponses[selectedDocument][questionTask].index;
  const curQuestion = questions[curIndex];
  const numCompleted = Object.values(
    userResponses[selectedDocument][questionTask].answers
  ).filter((value) => value !== null).length;
  const value =
    userResponses[selectedDocument][questionTask].answers[curQuestion.id];
  return (
    <Flex direction="column" marginY="16px">
      <Flex
        justifyContent="space-between"
        alignItems="center"
        marginBottom="16px"
      >
        <Flex>
          <Text>
            {numCompleted}/{questions.length} completed
          </Text>
        </Flex>
        <Flex>
          <Button
            isDisabled={curIndex === questions.length - 1}
            variant="secondary"
            marginEnd="16px"
            onPress={() => {
              setCtx((ctx) => {
                return produce(ctx, (draft) => {
                  ++draft.userResponses[selectedDocument][questionTask].index;
                });
              });
            }}
          >
            Next
          </Button>
          <Button
            isDisabled={curIndex === 0}
            onPress={() => {
              setCtx((ctx) => {
                return produce(ctx, (draft) => {
                  --draft.userResponses[selectedDocument][questionTask].index;
                });
              });
            }}
            variant="secondary"
          >
            Previous
          </Button>
        </Flex>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex>
          <Text>{curQuestion.text}</Text>
        </Flex>
        <Flex>
          <Flex marginEnd="16px">
            <Button
              onPress={() => {
                const nextCtx = produce(ctx, (draft) => {
                  draft.userResponses[selectedDocument][questionTask].answers[
                    curQuestion.id
                  ] = true;
                });
                saveToLocalStorage(nextCtx);
                setCtx(nextCtx);
              }}
              variant={value === true ? "primary" : "secondary"}
            >
              <ThumbsUp />
            </Button>
          </Flex>
          <Flex>
            <Button
              onPress={() => {
                const nextVal = produce(ctx, (draft) => {
                  draft.userResponses[selectedDocument][questionTask].answers[
                    curQuestion.id
                  ] = false;
                });
                saveToLocalStorage(nextVal);
                setCtx(nextVal);
              }}
              variant={value === false ? "primary" : "secondary"}
            >
              <ThumbsDown />
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const TaskCore = () => {
  const { documents, selectedDocument, selectedTab } = useMarch20();
  if (selectedDocument === null) {
    return null;
  }
  if (selectedTab !== "QA_TASK") {
    return <TaskForTextAndId />;
  }
  return <QaTask />;
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
      <Divider size="S" />
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

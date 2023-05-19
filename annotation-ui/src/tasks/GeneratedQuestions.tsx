import React from "react";
import { Flex, Text, Heading, Button, Well, Divider } from "@adobe/react-spectrum";
import {
  useDocumentContext,
  GENERATED_QUESTION_ORDER,
  useSetDoc,
} from "../context";
import produce from "immer";

export const GeneratedQuestions = () => {
  const {
    user_responses: { current_generated_question, GENERATED_QUESTIONS }
  } = useDocumentContext();
  const setDoc = useSetDoc();
  const numHighlights = GENERATED_QUESTIONS[
    GENERATED_QUESTION_ORDER[current_generated_question]
  ].highlights.length
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      {/* <Text UNSAFE_style={{ marginBottom: "15px" }}>
        Next you will be asked a set of questions about the PDF document you
        just read.
      </Text> */}
      <Text UNSAFE_style={{ marginBottom: "15px" }}>
        Read the question below and <b>highlight key sentences</b> in the document that help you
        formulate an answer to the question shown below. <br /><br />
        <ul>
          <li>When deciding what to highlight, think of each of your highlights as a necessary source to your answer. </li>
          <li>Select the smallest amount of complete sentences that contain all of the information required to answer the question.</li>
          <li>If you believe the question can not be answered, don’t highlight any part of the document.</li>
        </ul>
      </Text>

      <Text UNSAFE_style={{ marginBottom: "15px" }}>
        Once you are confident with your answer, continue.
      </Text>

      <Divider size="M" />

      <Heading level={4} marginBottom="size-100">Question</Heading>

      <Text marginBottom="16px">
        <em>
          {
            GENERATED_QUESTIONS[
              GENERATED_QUESTION_ORDER[current_generated_question]
            ].text
          }
        </em>
      </Text>

      <Well marginBottom="size-350">
        <Text>Number of highlights: {numHighlights}
        </Text>
      </Well>

      <Flex justifyContent="end">
        <Button
          onPress={() => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                const moreStagesLeft =
                  draft.user_responses.current_generated_question + 1 <
                  GENERATED_QUESTION_ORDER.length;
                if (moreStagesLeft) {
                  draft.user_responses.current_generated_question += 1;
                  draft.pdfRef.manager.removeAnnotationsFromPDF();
                } else {
                  draft.stage = "ANSWER_QUALITY";
                }
              });
            });
          }}
          variant="accent"
          // isDisabled={numHighlights === 0}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

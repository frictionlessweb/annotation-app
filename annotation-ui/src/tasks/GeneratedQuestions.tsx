import React from "react";
import { Flex, Text, Heading, Button } from "@adobe/react-spectrum";
import {
  useDocumentContext,
  GENERATED_QUESTION_ORDER,
  useSetDoc,
} from "../context";
import produce from "immer";

export const GeneratedQuestions = () => {
  const {
    user_responses: { current_generated_question, GENERATED_QUESTIONS },
  } = useDocumentContext();
  const setDoc = useSetDoc();
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text UNSAFE_style={{ marginBottom: "8px" }}>
        Next you will be asked a set of questions about the PDF document you
        just read.
      </Text>
      <Text UNSAFE_style={{ marginBottom: "8px" }}>
        Please highlight key sentences in the PDF document that help you
        formulate an answer to this question. Once you are confident with your
        answer, continue the survey.
      </Text>
      <Text marginBottom="16px">
        <em>
          {
            GENERATED_QUESTIONS[
              GENERATED_QUESTION_ORDER[current_generated_question]
            ].text
          }
        </em>
      </Text>
      <Flex>
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
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

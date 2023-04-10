import React from "react";
import { Flex, Text, Heading, TextArea, Button } from "@adobe/react-spectrum";
import { useDocumentContext, useSetDoc } from "../context";
import produce from "immer";

export const SuggestedQuestions = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  const isDisabled =
    doc.user_responses.SUGGESTED_QUESTIONS.question_one === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_two === "";
  return (
    <Flex marginX="32px" direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text UNSAFE_style={{ marginBottom: "16px" }}>
        Provide two additional questions that you think are interesting and can
        be answered based on content in the PDF document.
      </Text>
      <Text UNSAFE_style={{ marginBottom: "16px" }}>
        <em>No document will be shown. Answer based on what you remember of the document.</em>
      </Text>
      <Flex marginBottom="16px">
        <TextArea
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_one}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_one = val;
              });
            });
          }}
          width="100%"
          label="Question 1"
        />
      </Flex>
      <Flex>
        <TextArea
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_two = val;
              });
            });
          }}
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_two}
          width="100%"
          label="Question 2"
        />
      </Flex>
      <Flex marginTop="30px" justifyContent="end">
        <Button
          onPress={() => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.stage = "DONE";
              });
            });
          }}
          isDisabled={isDisabled}
          variant="accent"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

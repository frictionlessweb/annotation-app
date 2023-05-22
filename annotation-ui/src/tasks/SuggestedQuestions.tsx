import React from "react";
import {
  Flex,
  Text,
  Heading,
  TextArea,
  Button,
  TextField,
  Divider,
} from "@adobe/react-spectrum";
import Alert from "@spectrum-icons/workflow/Alert";
import { useDocumentContext, useSetDoc } from "../context";
import produce from "immer";

export const SuggestedQuestions = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  const isDisabled =
    doc.user_responses.SUGGESTED_QUESTIONS.question_one === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_two === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_three === "" ||
    doc.user_name === "";
  return (
    <Flex marginX="32px" direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text UNSAFE_style={{ marginBottom: "16px" }}>
        Provide five additional questions based on content in the PDF document. 
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
      <Flex marginBottom="16px">
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
      <Flex marginBottom="16px">
        <TextArea
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_three}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_three = val;
              });
            });
          }}
          width="100%"
          label="Question 3"
        />
      </Flex>
      
      <Divider size="M" marginTop="size-300"/>

      <Flex direction="column" gap="size-100" marginTop="size-200">
        {/* <Alert aria-label="Default Alert" /> */}
        <Text UNSAFE_style={{ marginBottom: "16px" }}>
          Enter your user name to record your submission:
        </Text>

        <TextField
          width="100%"
          placeholder="User Name"
          value={doc.user_name}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_name = val;
              });
            });
          }}
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

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
    doc.user_responses.SUGGESTED_QUESTIONS.question_easy === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_medium === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_hard === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_external === "" ||
    doc.user_responses.SUGGESTED_QUESTIONS.question_unrelated === "" ||
    doc.user_name === "";
  return (
    <Flex marginX="32px" direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text UNSAFE_style={{ marginBottom: "16px" }}>
        Provide five additional questions based on content in the PDF document. 
      </Text>
      <Flex marginBottom="16px">
        <TextArea
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_easy}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_easy = val;
              });
            });
          }}
          width="100%"
          label="Easy question: the answer can be found in exactly one paragraph or sentence on a single page"
        />
      </Flex>
      <Flex marginBottom="16px">
        <TextArea
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_medium = val;
              });
            });
          }}
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_medium}
          width="100%"
          label="Medium question: the answer can be found in more than one paragraph or sentence on a single page"
        />
      </Flex>
      <Flex marginBottom="16px">
        <TextArea
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_hard}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_hard = val;
              });
            });
          }}
          width="100%"
          label="Hard question: the answer can be found in more than one paragraph or sentence across multiple pages"
        />
      </Flex>

      <Flex marginBottom="16px">
        <TextArea
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_external}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_external = val;
              });
            });
          }}
          width="100%"
          label="External question: a question that is related to the document content but it's answer is not covered anywhere in the document"
        />
      </Flex>

      <Flex marginBottom="16px">
        <TextArea
          value={doc.user_responses.SUGGESTED_QUESTIONS.question_unrelated}
          onChange={(val) => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.user_responses.SUGGESTED_QUESTIONS.question_unrelated = val;
              });
            });
          }}
          width="100%"
          label="Unrelated question: a question that is completely unrelated to the document content."
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

import React from "react";
import {
  Flex,
  Text,
  TextArea,
  RadioGroup,
  Radio,
  Heading,
  Button,
} from "@adobe/react-spectrum";
import { useDocumentContext, useSetDoc, ApiResult } from "../context";
import produce from "immer";

const VALUES = [
  "I can easily understand and retell in my own words",
  "I can barely understand what this document is about",
];

const finishedTaskOne = (doc: ApiResult) => {
  return Object.values(doc.user_responses.INTRO_TASK).every(
    (val) => val !== ""
  );
};

export const IntroTask = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  const isDisabled = !finishedTaskOne(doc);
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text marginBottom={16}>
        This is a preview of the first page of a document you will have to read.
        Please provide two questions that you might want to answer based on this
        document’s content.
      </Text>
      <TextArea
        width="100%"
        value={doc.user_responses.INTRO_TASK.question_1}
        onChange={(val) => {
          setDoc((prev) => {
            if (typeof prev === "string") return prev;
            return produce(prev, (draft) => {
              draft.user_responses.INTRO_TASK.question_1 = val;
            });
          });
        }}
        label="Question 1"
      />
      <TextArea
        marginY="16px"
        width="100%"
        label="Question 2"
        value={doc.user_responses.INTRO_TASK.question_2}
        onChange={(val) => {
          setDoc((prev) => {
            if (typeof prev === "string") return prev;
            return produce(prev, (draft) => {
              draft.user_responses.INTRO_TASK.question_2 = val;
            });
          });
        }}
      />
      <Text>
        Based on this preview, select your understanding of the document:
      </Text>
      <RadioGroup
        value={doc?.user_responses?.INTRO_TASK?.preview_response}
        onChange={(val) => {
          setDoc((prev) => {
            if (typeof prev === "string") return prev;
            return produce(prev, (draft) => {
              draft.user_responses.INTRO_TASK.preview_response = val;
            });
          });
        }}
        label="Your Understanding"
      >
        {VALUES.map((value) => {
          return (
            <Radio key={value} value={value}>
              {value}
            </Radio>
          );
        })}
      </RadioGroup>
      <Flex marginTop="16px" justifyContent="end">
        <Button
          onPress={() => {
            setDoc((prevDoc) => {
              return produce(prevDoc, (draft) => {
                if (typeof draft === "string") return;
                draft.stage = "INTRO_DOCUMENT";
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

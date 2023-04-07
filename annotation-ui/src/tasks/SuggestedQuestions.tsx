import React from "react";
import { Flex, Text, Heading, TextArea, Button } from "@adobe/react-spectrum";
import { useSetDoc } from "../context";
import produce from "immer";

export const SuggestedQuestions = () => {
  const setDoc = useSetDoc();
  return (
    <Flex marginX="32px" direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text UNSAFE_style={{ maxWidth: "500px", marginBottom: "16px" }}>
        Provide two additional questions that you think are interesting and can
        be answered based on content in the PDF document.
      </Text>
      <Flex width="300px" marginBottom="16px">
        <TextArea width="100%" label="Question 1" />
      </Flex>
      <Flex width="300px">
        <TextArea width="100%" label="Question 2" />
      </Flex>
      <Flex marginTop="16px">
        <Button
          onPress={() => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === 'string') return;
                draft.stage = "DONE";
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

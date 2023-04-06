import React from "react";
import { Flex, Text, Heading, Button } from "@adobe/react-spectrum";
import { useDocumentContext, useSetDoc } from "../context";
import produce from "immer";

export const IntroDocument = () => {
  const doc = useDocumentContext();
  const setDoc = useSetDoc();
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text>
        Please skim the document carefully and identify the main topics covered.
      </Text>
      <ul>
        <li>
          As you read, highlight any sentences you think are important or
          interesting.
        </li>
        <li>This task should take no more than 15 minutes. </li>
      </ul>
      <Text>
        When you are confident and have identified the main topics, please
        continue.
      </Text>
      <Flex marginTop="16px">
        <Button
          onPress={() => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.stage = "GENERATED_QUESTIONS";
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

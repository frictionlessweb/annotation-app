import React from "react";
import { Flex, Text, Heading, Button, Well } from "@adobe/react-spectrum";
import { useSetDoc, useDocumentContext } from "../context";
import produce from "immer";

export const IntroDocument = () => {
  const numHighlights =
    useDocumentContext().user_responses.INTRO_DOCUMENT.highlights.length;
  const setDoc = useSetDoc();
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text>
        Please skim the document carefully and identify the main topics covered.
      </Text>
      <ul>
        <li>
          As you read,{" "}
          <b>highlight any sentences you think are important or interesting</b>.
        </li>
        <li>
          No need to read line-by-line, just skim and try to understand the gist of the document.
          {/* This task should take no more than <b>15 minutes</b>.{" "} */}
        </li>
      </ul>
      <Text>
        When you are confident and have identified the main topics, please
        continue.
      </Text>

      <Well marginY="size-200">
        <Text>Number of highlights: {numHighlights}</Text>
      </Well>

      <Flex marginTop="16px" justifyContent="end">
        <Button
          onPress={() => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                draft.stage = "GENERATED_QUESTIONS";
              });
            });
          }}
          isDisabled={numHighlights === 0}
          variant="accent"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

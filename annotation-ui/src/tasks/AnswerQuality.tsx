import React from "react";
import {
  Flex,
  Text,
  ProgressBar as SpectrumProgressBar,
  Heading,
  ListView,
  Button,
  Item,
  Slider,
} from "@adobe/react-spectrum";
import { useDocumentContext, STAGE_MAP, ANSWER_QUALITY_ITEMS } from "../context";
import { IntroTask } from "./IntroTask";
import { IntroDocument } from "./IntroDocument";
import { GeneratedQuestions } from "./GeneratedQuestions";
import { PDF } from "./PDF";

export const AnswerQuality = () => {
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text>
        Next you will be asked to rate the quality of answers for each question
        provided. For each statement below, provide your assessment of the{" "}
        {`answer's `}
        quality. Feel free to refer back to the document (as needed).
      </Text>
      <Heading level={4}>Question</Heading>
      <Text>This is the question</Text>
      <Heading level={4}>Answer</Heading>
      <Text marginBottom="16px">This is the answer</Text>
      <ListView
        selectionMode="multiple"
        aria-label="Static ListView items example"
        overflowMode="wrap"
      >
        {ANSWER_QUALITY_ITEMS.map((anItem) => {
          return <Item key={anItem}>{anItem}</Item>;
        })}
      </ListView>
      <Text marginY="16px">
        Overall, how would you rate the quality of the answer to the question?
      </Text>
      <Slider
        label="Select Value"
        defaultValue={1}
        minValue={1}
        maxValue={5}
        step={1}
      />
      <Flex marginTop="16px" justifyContent="end">
        <Button variant="accent">Next</Button>
      </Flex>
    </Flex>
  );
};

import React from "react";
import {
  Flex,
  Text,
  Heading,
  Button,
  Slider,
  RadioGroup,
  Radio,
} from "@adobe/react-spectrum";
import {
  ANSWER_QUALITY_ITEMS,
  useSetDoc,
} from "../context";
import produce from 'immer';

export const AnswerQuality = () => {
  const setDoc = useSetDoc();
  return (
    <Flex direction="column" maxHeight="300px">
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
      {ANSWER_QUALITY_ITEMS.map((anItem) => {
        return (
          <Flex key={anItem} direction="column" marginBottom="16px">
            <Text>{anItem}</Text>
            <RadioGroup>
              <Radio value="YES">Yes</Radio>
              <Radio value="NO">No</Radio>
              <Radio value="NOT_SURE">Not Sure</Radio>
            </RadioGroup>
          </Flex>
        );
      })}
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
        <Button onPress={() => {
          setDoc(prev => {
            return produce(prev, (draft) => {
              if (typeof draft === 'string') return;
              draft.stage = 'SUGGESTED_QUESTIONS';
            });
          });
        }} variant="accent">Next</Button>
      </Flex>
    </Flex>
  );
};

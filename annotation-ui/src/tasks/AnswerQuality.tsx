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
  GENERATED_QUESTION_ORDER,
  useSetDoc,
  useDocumentContext,
} from "../context";
import produce from "immer";

export const AnswerQuality = () => {
  const ctx = useDocumentContext();
  const setDoc = useSetDoc();
  const { current_answer_quality } = ctx.user_responses;
  const currentAnswerMap =
    ctx.user_responses.ANSWER_QUALITY[
      GENERATED_QUESTION_ORDER[current_answer_quality]
    ];
  const currentIndex = currentAnswerMap.index;
  const currentAnswer = currentAnswerMap.answers[currentIndex];
  const currentQuestion = currentAnswerMap.text;
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
      <Text>{currentQuestion}</Text>
      <Heading level={4}>Answer</Heading>
      <Text>{currentAnswer.text}</Text>
      {ANSWER_QUALITY_ITEMS.map((anItem) => {
        return (
          <Flex key={anItem} direction="column" marginBottom="16px">
            <Text>{anItem}</Text>
            <RadioGroup
              onChange={(val) => {
                setDoc((prev) => {
                  return produce(prev, (draft) => {
                    if (typeof draft === "string") return;
                    const currentAnswerMap =
                      draft.user_responses.ANSWER_QUALITY[
                        GENERATED_QUESTION_ORDER[current_answer_quality]
                      ];
                    const currentIndex = currentAnswerMap.index;
                    const currentAnswer =
                      currentAnswerMap.answers[currentIndex];
                    currentAnswer[anItem] = val;
                  });
                });
              }}
              value={currentAnswer[anItem]}
            >
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
        value={currentAnswer.overall_rating}
        onChange={(val) => {
          setDoc((prev) => {
            return produce(prev, (draft) => {
              if (typeof draft === "string") return;
              const currentAnswerMap =
                draft.user_responses.ANSWER_QUALITY[
                  GENERATED_QUESTION_ORDER[current_answer_quality]
                ];
              const currentIndex = currentAnswerMap.index;
              const currentAnswer = currentAnswerMap.answers[currentIndex];
              currentAnswer.overall_rating = val;
            });
          });
        }}
        minValue={1}
        maxValue={5}
        step={1}
      />
      <Flex marginTop="16px" justifyContent="end">
        <Button
          onPress={() => {
            setDoc((prev) => {
              return produce(prev, (draft) => {
                if (typeof draft === "string") return;
                const currentAnswerMap =
                  draft.user_responses.ANSWER_QUALITY[
                    GENERATED_QUESTION_ORDER[current_answer_quality]
                  ];

                const currentIndex = currentAnswerMap.index;
                const answersRemain =
                  currentIndex < currentAnswerMap.answers.length - 1;
                const questionsRemain =
                  current_answer_quality < GENERATED_QUESTION_ORDER.length - 1;

                if (answersRemain) {
                  currentAnswerMap.index++;
                  window.scrollTo(0, 0);
                } else if (questionsRemain) {
                  draft.user_responses.current_answer_quality++;
                  window.scrollTo(0, 0);
                } else {
                  draft.stage = "SUGGESTED_QUESTIONS";
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
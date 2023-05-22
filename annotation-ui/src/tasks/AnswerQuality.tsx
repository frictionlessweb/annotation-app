import React from "react";
import {
  Flex,
  Text,
  Heading,
  Button,
  Slider,
  RadioGroup,
  Radio,
  ActionGroup,
  Item,
  Divider, 
  TextArea
} from "@adobe/react-spectrum";
import {
  ANSWER_QUALITY_ITEMS,
  GENERATED_QUESTION_ORDER,
  POSSIBLE_ANSWERS,
  useSetDoc,
  useDocumentContext,
  answerIsComplete,
  AnswerKey,
} from "../context";
import produce from "immer";

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export const AnswerQuality = () => {
  const [curItem, setCurItem] = React.useState(0);
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
  const nextDisabled = !answerIsComplete(currentAnswer);
  const RENDERING_ANSWER_QUALITY_ITEMS = React.useMemo(() => {
    return ANSWER_QUALITY_ITEMS
    // return shuffleArray(JSON.parse(JSON.stringify(ANSWER_QUALITY_ITEMS)));
  }, []);
  return (
    <Flex direction="column">
      <Heading level={3}>Instructions</Heading>
      <Text>
        For each question and answer pair below, provide your ratings for the three items below. 
        Feel free to refer back to the document as needed.
      </Text>
      <Heading level={4} marginBottom="size-100">
        Question
      </Heading>
      <Text>
        <em>{currentQuestion}</em>
      </Text>
      <Heading level={4} marginBottom="size-100">
        Answer
      </Heading>
      <Text marginTop="size-0" marginBottom="16px">
        <pre
          style={{
            font: "inherit",
            display: "flex",
            width: "400px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            margin: "0",
          }}
        >
          {currentAnswer.text.trim()}
        </pre>
      </Text>
      {/* <Flex width="100%" justifyContent="center">
        <Flex
          width="80%"
          height="2px"
          marginBottom="16px"
          UNSAFE_style={{ backgroundColor: "lightgrey" }}
        >
          {" "}
        </Flex>
      </Flex> */}

      <Divider size="M" marginBottom="size-300"/>

      <Flex direction="column" marginBottom="size-300">
        <Text>
          <b>Part 1: </b>
          Does any part of the answer say 'I don’t know' or that there is 'insufficient context' to provide an answer?
        </Text>
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
                currentAnswerMap.answers[currentIndex][
                  "Does any part of the answer say 'I don’t know' or that there’s 'insufficient context' to provide an answer?"
                ] = val;
              });
            });
          }}
          value={
            currentAnswerMap.answers[currentIndex]["Does any part of the answer say 'I don’t know' or that there’s 'insufficient context' to provide an answer?"]
          }
        >
          <Radio value="Yes, the answer contains 'I don’t know' or there is 'insufficient context'">
            Yes, the answer contains 'I don’t know' or there is 'insufficient context'
          </Radio>
          <Radio
            value={`No, the answer does not contain any of these phrases`}
          >
            No, the answer does not contain any of these phrases
          </Radio>
        </RadioGroup>
      </Flex>

      <Flex direction="column" marginBottom="size-100">
        <Text marginBottom="8px">
          <b>Part 2: </b>
          Please indicate your agreement with the following statements:
        </Text>
        {(() => {
          const anItem = RENDERING_ANSWER_QUALITY_ITEMS[curItem] as AnswerKey;
          return (
            <Flex key={anItem} direction="column" marginBottom="size-100">
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
                      (currentAnswer[anItem] as string) = val;
                    });
                  });
                  // setCurItem(
                  //   curItem === ANSWER_QUALITY_ITEMS.length - 1
                  //     ? 0
                  //     : curItem + 1
                  // );
                }}
                value={currentAnswer[anItem] as string}
              >
                {POSSIBLE_ANSWERS.map((answer) => {
                  return (
                    <Radio key={answer} value={answer}>
                      {answer}
                    </Radio>
                  );
                })}
              </RadioGroup>
            </Flex>
          );
        })()}

        {RENDERING_ANSWER_QUALITY_ITEMS[curItem] == "The answer contains inaccurate information (e.g., information that is made up or not true)." && (
          <TextArea
            value={currentAnswerMap.answers[currentIndex].inaccurate_text}
            onChange={(val) => {
              setDoc((prev) => {
                return produce(prev, (draft) => {
                  if (typeof draft === "string") return;
                  // draft.user_responses.SUGGESTED_QUESTIONS.question_unrelated = val;
                  const currentAnswerMap =
                    draft.user_responses.ANSWER_QUALITY[
                      GENERATED_QUESTION_ORDER[current_answer_quality]
                    ];
                  const currentIndex = currentAnswerMap.index;
                  const currentAnswer = currentAnswerMap.answers[currentIndex];
                  currentAnswer.inaccurate_text = val;
                });
              });
            }}
            width="100%"
            label="What part(s) of the answer are inaccurate? Copy specific sentences or phrases from the answer that are inaccurate."
          />
        )}

        {RENDERING_ANSWER_QUALITY_ITEMS[curItem] == "The answer contains information not found in the document (e.g., information that does not exist in this document)." && (
          <TextArea
            value={currentAnswerMap.answers[currentIndex].external_text}
            onChange={(val) => {
              setDoc((prev) => {
                return produce(prev, (draft) => {
                  if (typeof draft === "string") return;
                  // draft.user_responses.SUGGESTED_QUESTIONS.question_unrelated = val;
                  const currentAnswerMap =
                    draft.user_responses.ANSWER_QUALITY[GENERATED_QUESTION_ORDER[current_answer_quality]];
                  const currentIndex = currentAnswerMap.index;
                  const currentAnswer = currentAnswerMap.answers[currentIndex];
                  currentAnswer.external_text = val;
                });
              });
            }}
            width="100%"
            label="What part(s) of the answer are not found in the document? Copy specific sentences or phrases from the answer that are not found in the documet."
          />
        )}

        <ActionGroup
          marginTop="size-200"
          disabledKeys={(() => {
            if (curItem === 0) return ["previous"];
            if (curItem === ANSWER_QUALITY_ITEMS.length - 1) return ["next"];
          })()}
          onAction={(key) => {
            setCurItem((item) => item + (key === "next" ? 1 : -1));
          }}
        >
          <Item key="previous">Previous</Item>
          <Item key="next">Next</Item>
        </ActionGroup>

      </Flex>

      <Text marginY="16px">
        <b>Part 3: </b>
        Overall, how would you rate the quality of the answer to the question?
        <br />
        1-Terrible, 2-Poor, 3-Average, 4-Good, 5-Excellent
      </Text>
      <Slider
        width="90%"
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

      <Text marginY="16px">
        <b>Part 4: </b>
        Do you feel confident in the ratings you provided for this question-answer?
        <br />
        1-Not very confident, 2-Somewhat confident, 3-Unsure, 4-Somwhat confident, 5-Very confident
      </Text>
      <Slider
        width="90%"
        label="Select Value"
        value={currentAnswer.confidence_rating}
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
              currentAnswer.confidence_rating = val;
            });
          });
        }}
        minValue={1}
        maxValue={5}
        step={1}
      />

      <Flex marginTop="16px" marginBottom="16px" justifyContent="end">
        <Button
          isDisabled={nextDisabled}
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
            setCurItem(0);
          }}
          variant="accent"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

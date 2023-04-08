import React from "react";
import {
  Flex,
  ProgressBar as SpectrumProgressBar,
} from "@adobe/react-spectrum";
import { useDocumentContext, STAGE_MAP } from "../context";
import { IntroTask } from "./IntroTask";
import { IntroDocument } from "./IntroDocument";
import { GeneratedQuestions } from "./GeneratedQuestions";
import { PDF } from "./PDF";
import { AnswerQuality } from "./AnswerQuality";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { Done } from "./Done";

const StageRouter = () => {
  const ctx = useDocumentContext();
  switch (ctx.stage) {
    case "INTRO_TASK": {
      return <IntroTask />;
    }
    case "INTRO_DOCUMENT": {
      return <IntroDocument />;
    }
    case "GENERATED_QUESTIONS": {
      return <GeneratedQuestions />;
    }
    case "ANSWER_QUALITY": {
      return <AnswerQuality />;
    }
    case "SUGGESTED_QUESTIONS": {
      return <SuggestedQuestions />;
    }
    case "DONE": {
      return <Done />;
    }
    default: {
      throw new Error(`Unexpected stage: ${ctx.stage}`);
    }
  }
};

const ProgressBar = () => {
  const ctx = useDocumentContext();
  return (
    <Flex maxHeight="30px">
      <SpectrumProgressBar
        label={STAGE_MAP[ctx.stage].display}
        value={
          100 * (STAGE_MAP[ctx.stage].order / Object.keys(STAGE_MAP).length)
        }
      />
    </Flex>
  );
};

export const DocumentForm = () => {
  const { stage } = useDocumentContext();
  const isLastStage = stage === "DONE" || stage === "SUGGESTED_QUESTIONS";
  return (
    <Flex
      margin="16px"
      justifyContent={isLastStage ? "start" : "space-between"}
    >
      <ProgressBar />
      <PDF />
      <Flex maxWidth={isLastStage ? undefined : "400px"}>
        <StageRouter />
      </Flex>
    </Flex>
  );
};

import React from "react";
import {
  Flex,
  Text,
  ProgressBar as SpectrumProgressBar,
} from "@adobe/react-spectrum";
import { useDocumentContext, STAGE_MAP } from "../context";
import { IntroTask } from "./IntroTask";
import { IntroDocument } from './IntroDocument';
import { GeneratedQuestions } from './GeneratedQuestions';
import { PDF } from './PDF';

const AnswerQuality = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const SuggestedQuestions = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const Done = () => {
  return (
    <Flex>
      <Text>You have finished all of the tasks. Thank you!</Text>
    </Flex>
  );
};

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
  return (
    <Flex margin="16px" justifyContent="space-between">
      <ProgressBar />
      <PDF />
      <Flex maxWidth="400px">
        <StageRouter />
      </Flex>
    </Flex>
  );
};

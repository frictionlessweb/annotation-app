import React from "react";
import {
  Flex,
  Text,
  ProgressBar as SpectrumProgressBar,
} from "@adobe/react-spectrum";
import { useDocumentContext, STAGE_MAP } from "../context";

const IntroTask = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const IntroDocument = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

const GeneratedQuestions = () => {
  return (
    <Flex>
      <Text>Write me</Text>
    </Flex>
  );
};

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

const ProgressBar = () => {
  const ctx = useDocumentContext();
  return (
    <Flex>
      <SpectrumProgressBar
        label={STAGE_MAP[ctx.stage].display}
        value={STAGE_MAP[ctx.stage].order / Object.keys(STAGE_MAP).length}
      />
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
    default: {
      throw new Error(`Unexpected stage: ${ctx.stage}`);
    }
  }
};

export const DocumentForm = () => {
  return (
    <Flex margin="16px" justifyContent="space-between">
      <ProgressBar />
      <Text>The PDF will go here.</Text>
      <StageRouter />
    </Flex>
  );
};

import React from "react";
import {
  Flex,
  Grid,
  ProgressBar as SpectrumProgressBar,
  TextField,
} from "@adobe/react-spectrum";
import { useDocumentContext, useSetDoc, STAGE_MAP } from "../context";
import { IntroTask } from "./IntroTask";
import { IntroDocument } from "./IntroDocument";
import { GeneratedQuestions } from "./GeneratedQuestions";
import { PDF } from "./PDF";
import { AnswerQuality } from "./AnswerQuality";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { Done } from "./Done";
import produce from "immer";

const StageRouter = () => {
  const { stage, user_responses } = useDocumentContext();
  React.useEffect(() => {
    const documentName = window.location.pathname.split("/").pop();
    window.localStorage.setItem(
      documentName || "",
      JSON.stringify({ user_responses, stage })
    );
  }, [stage, user_responses]);
  switch (stage) {
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
      throw new Error(`Unexpected stage: ${stage}`);
    }
  }
};

const ProgressBar = () => {
  const ctx = useDocumentContext();
  const setDoc = useSetDoc();
  return (
    <Flex maxHeight="30px">
      <SpectrumProgressBar
        label={STAGE_MAP[ctx.stage].display}
        value={
          100 * (STAGE_MAP[ctx.stage].order / Object.keys(STAGE_MAP).length)
        }
      />
      <TextField
        marginStart="16px"
        placeholder="User Name"
        value={ctx.user_name}
        onChange={(val) => {
          setDoc((prev) => {
            return produce(prev, (draft) => {
              if (typeof draft === "string") return;
              draft.user_name = val;
            });
          });
        }}
      />
    </Flex>
  );
};

export const DocumentForm = () => {
  const { stage } = useDocumentContext();
  const isLastStage = stage === "DONE" || stage === "SUGGESTED_QUESTIONS";
  return (
    <Grid
      marginEnd="size-200"
      areas={["header  header", "pdf form"]}
      columns={["4fr", "1.5fr"]}
      rows={["size-675", "auto"]}
      height="100vh"
      maxHeight="100vh"
      gap="size-160"
    >
      <Flex
        gridArea="header"
        direction="row"
        marginX="size-500"
        alignItems="center"
      >
        <ProgressBar />
      </Flex>
      <Flex gridArea="pdf">
        <PDF />
      </Flex>
      <Flex gridArea="form" margin="size-160">
        <StageRouter />
      </Flex>
    </Grid>
  );
};

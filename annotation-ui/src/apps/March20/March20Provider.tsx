import React from "react";
import { Text } from "@adobe/react-spectrum";
import {
  generateProviders,
  fetchDocuments,
  readFromLocalStorage,
  EffectThunk,
} from "../util/util";

interface TextAndId {
  id: string;
  text: string;
}

type ResponseRecord = Record<string, boolean | null>;

// TOPIC TASK
export const TOPIC_TASK_INSTRUCTIONS = (
  <>
    <Text marginBottom="16px">
      Relevant topics characterize the type of document, the type of content
      discussed in the document or is an important keyword discussed in the
      document.
    </Text>
    <Text>
      For each topic consider: Is the topic relevant to the content in the
      document?
    </Text>
  </>
);

// QUESTION TASK
export const QUESTION_TASK_INSTRUCTIONS = (
  <>
    <Text>
      The follwoing are suggested questions that can be answered by content
      covered in the document.
    </Text>
    <Text>For each question consider:</Text>
    <ul>
      <li>Does the question bring up important document content?</li>
      <li>
        Does the question bring up document content you find important but had
        not focused on before?
      </li>
    </ul>
  </>
);

// STATEMENTS TASK
export const STATEMENTS_TASK_INSTRUCTIONS = (
  <>
    <Text>
      The following are statements related to content covered in the document.
    </Text>
    <Text>For each statement consider:</Text>
    <ul>
      <li>Does the statement bring up important document content?</li>
      <li>
        Does the statement bring up document content you find important but had
        not focused on before?
      </li>
    </ul>
  </>
);

// Q&A TASK
export const QA_TASK_INSTRUCTIONS = (
  <Text>
    The following are question and answer pairs. For each pair, choose all that
    apply.
  </Text>
);

interface QaQuestionPrompt {
  id: string;
  question: string;
  answer: string;
}

type QaQuestionResponse = Record<
  string,
  { visited: boolean; answers: [boolean, boolean, boolean, boolean] }
>;

interface Week20Document {
  pdf_url: string;
  title: string;
  questions: {
    topicTask: TextAndId[];
    questionTask: TextAndId[];
    statementsTask: TextAndId[];
    qaTask: QaQuestionPrompt[];
  };
}

interface Week20Response {
  topicTask: ResponseRecord;
  questionTask: ResponseRecord;
  statementsTask: ResponseRecord;
  qaTask: QaQuestionResponse;
}

type Documents = Record<string, Week20Document>;

type UserResponses = Record<string, Week20Response>;

export const textIdToResponse = (textId: TextAndId[]): ResponseRecord => {
  const responses: ResponseRecord = {};
  for (const el of textId) {
    responses[el.id] = null;
  }
  return responses;
};

export const qaQuestionsToResponse = (
  qaTask: QaQuestionPrompt[]
): QaQuestionResponse => {
  const response: QaQuestionResponse = {};
  for (const task of qaTask) {
    response[task.id] = {
      visited: false,
      answers: [false, false, false, false],
    };
  }
  return response;
};

export const userResponsesFromDocuments = (docs: Documents): UserResponses => {
  const out: UserResponses = {};
  const documentIds = Object.keys(docs);
  for (const docId of documentIds) {
    const doc = docs[docId];
    const {
      questions: { qaTask, questionTask, statementsTask, topicTask },
    } = doc;
    const userResponse: Week20Response = {
      questionTask: textIdToResponse(questionTask),
      statementsTask: textIdToResponse(statementsTask),
      topicTask: textIdToResponse(topicTask),
      qaTask: qaQuestionsToResponse(qaTask),
    };
    out[docId] = userResponse;
  }
  return out;
};

export interface Week20Context {
  selectedDocument: string | null;
  documents: Documents;
  userResponses: UserResponses;
}

interface ProviderProps {
  children: React.ReactNode;
}

const fetchDocumentsEffect: EffectThunk<Week20Context> = (setState) => () => {
  const getDocuments = async () => {
    try {
      // TODO: Filter out the documents by the appropriate assignment.
      const documents: Documents = await fetchDocuments();
      setState({
        documents,
        selectedDocument: null,
        userResponses:
          readFromLocalStorage() || userResponsesFromDocuments(documents),
      });
    } catch (err) {
      setState("ERROR");
    }
  };
  getDocuments();
};

const { Provider, useSetValue, useValue } =
  generateProviders<Week20Context>(fetchDocumentsEffect);

export const March20Provider = Provider;
export const useSetMarch20 = useSetValue;
export const useMarch20 = useValue;
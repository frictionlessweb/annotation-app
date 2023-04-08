import React from "react";
import { Flex, Text } from "@adobe/react-spectrum";
import { ToastQueue } from "@react-spectrum/toast";
import { useDocumentContext } from "../context";

export const Done = () => {
  const ctx = useDocumentContext();
  React.useEffect(() => {
    const saveResponse = async () => {
      try {
        const documentName = window.location.pathname.split("/").pop();
        await window.fetch(`/api/v1/save-document-session`, {
          method: "POST",
          body: JSON.stringify({
            document: documentName,
            user_responses: ctx.user_responses,
          }),
        });
        ToastQueue.positive("Saved successfully.");
      } catch (err) {
        ToastQueue.negative(
          "An error occurred. Please refresh the page and try again."
        );
      }
    };
    saveResponse();
  }, [ctx]);
  return (
    <Flex marginX="32px">
      <Text>You have finished all of the tasks. Thank you!</Text>
    </Flex>
  );
};

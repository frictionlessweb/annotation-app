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
        if (ctx.user_name === "" || typeof ctx.user_name !== "string") {
          throw new Error("Invalid user name");
        }
        const res = await window.fetch(`/api/v1/save-document-session`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            document: documentName,
            user_responses: { ...ctx.user_responses, user_name: ctx.user_name },
          }),
        });
        if (!res.ok) {
          throw new Error("API REQUEST FAILED");
        }
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

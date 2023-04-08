import React from "react";
import { Flex, Text } from "@adobe/react-spectrum";

export const FatalApiError = () => {
  return (
    <Flex
      width="100%"
      justifyContent="center"
      UNSAFE_style={{ paddingTop: "32px", paddingBottom: "32px" }}
    >
      <Text UNSAFE_style={{ maxWidth: "500px" }}>
        A fatal error occurred when trying to load the document. Are you sure
        the link that you have for this task is correct?
      </Text>
    </Flex>
  );
};

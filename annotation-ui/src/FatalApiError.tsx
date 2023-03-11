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
        A fatal error occurred when trying to load the documents and their
        associated topics. Please refresh the page and try again.
      </Text>
    </Flex>
  );
};

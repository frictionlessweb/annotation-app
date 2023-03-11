import React from "react";
import { Flex, Picker, Item, ProgressCircle } from "@adobe/react-spectrum";

export const Loading = () => {
  return (
    <Flex
      width="100%"
      justifyContent="center"
      UNSAFE_style={{ paddingTop: "32px", paddingBottom: "32px" }}
    >
      <ProgressCircle size="L" isIndeterminate />
    </Flex>
  );
};

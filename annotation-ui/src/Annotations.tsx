import React from "react";
import { Flex, Picker, Item } from "@adobe/react-spectrum";

export const Annotations = () => {
  return (
    <>
      <Flex direction="column" data-testid="ANNOTATION_APP">
        <Flex>
          <Picker label="Select a Document">
            <Item>Test</Item>
            <Item>Test2</Item>
          </Picker>
        </Flex>
        <Flex width="100%">
          <Flex width="50%">Test</Flex>
          <Flex width="50%">Test2</Flex>
        </Flex>
      </Flex>
    </>
  );
};

import React from "react";
import { Flex, Text } from "@adobe/react-spectrum";
import { Route } from "wouter";
import { DocumentRouter } from './DocumentRouter';

export const Router = () => {
  return (
    <Flex direction="column">
      <Route path="/">
        <Text>Welcome.</Text>
      </Route>
      <Route path="/:document">
        <DocumentRouter />
      </Route>
    </Flex>
  );
};

import React from "react";
import { Route } from "wouter";
import { LogIn } from "./LogIn";
import { AnnotationRouter } from "./apps";
import { Flex } from "@adobe/react-spectrum";

export const Router = () => {
  return (
    <>
      <Route path="/">
        <LogIn />
      </Route>
      <Route path="/:name">
        <Flex
          width="100%"
          direction="column"
          data-testid="ANNOTATION_APP"
          height="100%"
        >
          <AnnotationRouter />
        </Flex>
      </Route>
    </>
  );
};

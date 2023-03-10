import React from "react";
import { Flex, TextField, Heading, Button } from "@adobe/react-spectrum";
import { useLocation } from "wouter";

export const LogIn = () => {
  const [name, setName] = React.useState("");
  const [_, setLocation] = useLocation();
  const gotoApp = React.useCallback(() => {
    setLocation(`/${name}`);
  }, [name, setLocation]);
  return (
    <Flex
      direction="column"
      width="100%"
      alignItems="center"
      justifyContent="center"
      UNSAFE_style={{ padding: "32px" }}
    >
      <Flex direction="column">
        <Flex>
          <Heading level={1}>Enter Your Name</Heading>
        </Flex>
        <Flex marginBottom="32px">
          <TextField
            data-testid="NAME"
            aria-label="Enter your name."
            onChange={setName}
          />
        </Flex>
        <Flex marginBottom="16px">
          <Button data-testid="GOTO_APP" isDisabled={name === ""} variant="primary" onPress={gotoApp}>
            Begin Annotating
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

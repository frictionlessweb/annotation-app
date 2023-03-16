import React from "react";
import {
  Flex,
  TextField,
  Heading,
  Button,
  Picker,
  Item,
} from "@adobe/react-spectrum";
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
          <Picker>
            <Item key="Joe">Joe</Item>
            <Item key="Nedim">Nedim</Item>
            <Item key="Alex">Alexa</Item>
            <Item key="Josh">Josh</Item>
          </Picker>
        </Flex>
        <Flex marginBottom="16px">
          <Button
            data-testid="GOTO_APP"
            isDisabled={name === ""}
            variant="primary"
            onPress={gotoApp}
          >
            Begin Judging Annotations
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

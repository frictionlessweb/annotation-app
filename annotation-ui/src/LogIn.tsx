import React from "react";
import { Flex, Heading, Button, Picker, Item } from "@adobe/react-spectrum";
import { useLocation } from "wouter";
import assignments from "./assignments.json";

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
          <Picker
            onSelectionChange={(key) => {
              setName(key as string);
            }}
          >
            {assignments.map((assignment) => {
              return <Item key={assignment.user}>{assignment.user}</Item>;
            })}
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

import React from "react";
import { Flex, Heading, Button, Picker, Item } from "@adobe/react-spectrum";
import { useLocation } from "wouter";
import assignments from "./assignments.json";

const WEEKS = {
  MARCH_13: "March 13th",
  MARCH_20: "March 20th",
};

type Week = keyof typeof WEEKS | "";

export const LogIn = () => {
  const [name, setName] = React.useState("");
  const [week, setWeek] = React.useState<Week>("");
  const [_, setLocation] = useLocation();
  const gotoApp = React.useCallback(() => {
    setLocation(`/${name}?week=${week}`);
  }, [name, setLocation, week]);
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
          <Heading level={2}>Welcome</Heading>
        </Flex>
        <Flex marginBottom="32px">
          <Picker
            selectedKey={week}
            placeholder="Week..."
            onSelectionChange={(key) => {
              setWeek(key as Week);
            }}
          >
            {Object.entries(WEEKS).map(([key, display]) => {
              return <Item key={key}>{display}</Item>;
            })}
          </Picker>
        </Flex>
        <Flex marginBottom="32px">
          <Picker
            isDisabled={week === ""}
            selectedKey={name}
            placeholder="Name..."
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
            isDisabled={name === "" || week === ""}
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

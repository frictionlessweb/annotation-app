import React from "react";
import { Flex, Heading, Button, Picker, Item } from "@adobe/react-spectrum";
import { useLocation } from "wouter";
import MARCH_13 from "./march13.json";
import MARCH_20 from "./march20.json";

const WEEKS = {
  MARCH_13: {
    display: "March 13th",
    assignments: MARCH_13,
  },
  MARCH_20: {
    display: "March 20th",
    assignments: MARCH_20,
  },
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
            {Object.entries(WEEKS).map(([key, { display }]) => {
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
            {(week !== "" ? WEEKS[week].assignments : []).map((assignment) => {
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
            Begin Task
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

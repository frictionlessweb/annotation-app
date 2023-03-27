import React from "react";
import {
  Flex,
  Heading,
  Button,
  Picker,
  Item,
  TableView,
  Column,
  TableHeader,
  Row,
  Cell,
  TableBody,
  Text,
  Divider,
} from "@adobe/react-spectrum";
import Yes from "@spectrum-icons/workflow/CheckmarkCircle";
import No from "@spectrum-icons/workflow/Cancel";
import { FatalApiError } from "./components/FatalApiError";
import { Loading } from "./components/Loading";
import { useLocation } from "wouter";
import { downloadJson } from "./apps/util/util";
import MARCH_13 from "./march13.json";
import MARCH_20 from "./march20.json";
import { Divide } from "@spectrum-icons/workflow";

const USERS = Array.from(
  new Set(MARCH_13.map((x) => x.user).concat(MARCH_20.map((x) => x.user)))
);

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

interface ProgressProps {
  user: string;
}

interface Progress {
  complete: boolean;
  json: object;
  week: string;
}

const Progress = (props: ProgressProps) => {
  const { user } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<Progress[]>([]);
  React.useEffect(() => {
    const fetchResultsEffect = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await window.fetch(
          `/api/v1/response-by-person?name=${user}`
        );
        if (!res.ok) {
          setError("ERROR OCCURRED");
          return;
        }
        const json: Progress[] = await res.json();
        setProgress(json);
      } finally {
        setLoading(false);
      }
    };
    fetchResultsEffect();
  }, [user]);
  if (loading === true) {
    return <Loading />;
  }
  if (error !== null) {
    return <FatalApiError />;
  }
  return (
    <Flex direction="column">
      <Text marginBottom="16px">Progress for {user}</Text>
      {progress.length <= 0 ? (
        <Text>No results.</Text>
      ) : (
        <TableView minWidth={400}>
          <TableHeader>
            <Column>User</Column>
            <Column>Complete</Column>
            <Column>JSON</Column>
          </TableHeader>
          <TableBody>
            {progress.map((aWeek) => {
              return (
                <Row key={aWeek.week}>
                  <Cell>{aWeek.week}</Cell>
                  <Cell>
                    {aWeek.complete ? (
                      <Yes color="positive" />
                    ) : (
                      <No color="negative" />
                    )}
                  </Cell>
                  <Cell>
                    <Button
                      variant="primary"
                      onPress={() => downloadJson(aWeek.json)}
                    >
                      Download
                    </Button>
                  </Cell>
                </Row>
              );
            })}
          </TableBody>
        </TableView>
      )}
    </Flex>
  );
};

export const LogIn = () => {
  const [name, setName] = React.useState("");
  const [week, setWeek] = React.useState<Week>("");
  const [_, setLocation] = useLocation();
  const [progressUser, setProgressUser] = React.useState<string>("");
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
      <Flex alignItems="start" height="100%" marginX="32px" direction="column">
        <Heading level={2}>Progress</Heading>
        <Flex marginBottom="32px">
          <Picker
            selectedKey={progressUser}
            placeholder="User..."
            onSelectionChange={(key) => {
              setProgressUser(key as string);
            }}
          >
            {USERS.map((user) => {
              return <Item key={user}>{user}</Item>;
            })}
          </Picker>
        </Flex>
        <Divider size="S" marginY="32px" />
        {progressUser !== "" ? (
          <Progress user={progressUser} />
        ) : (
          <Text>Please select a user to see their progress.</Text>
        )}
      </Flex>
    </Flex>
  );
};

import React from "react";
import { Flex, Text, Button } from "@adobe/react-spectrum";
import { Route, Link } from "wouter";
import { DocumentRouter } from "./DocumentRouter";
import { ToastQueue } from "@react-spectrum/toast";

const DOCUMENTS = [
  "DR--276543213_INTRO",
  "DR--287141424_INTRO",
  "DR--230018376_INTRO",
  "DR--479830708_INTRO",
  "DR--491573508_INTRO",
  "DR--231406771_INTRO",
  "DR--182866691_INTRO",
  "DR--39293534_INTRO",
  "DR--23210832_INTRO",
  "DR--521647139_INTRO",
  "DR--327389138_INTRO",
  "DR--30823528_INTRO",
  "DR--176841814_INTRO",
];

const downloadJson = (json: object) => {
  const element = document.createElement("a");
  const textFile = new Blob([JSON.stringify(json)], {
    type: "text/plain",
  });
  element.href = URL.createObjectURL(textFile);
  element.download = "annotations.json";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const Router = () => {
  return (
    <Flex direction="column">
      <Route path="/">
        <Flex direction="column" margin="8px">
          <Text>Welcome!</Text>
          <Text>Please select a task:</Text>
          <ul>
            {DOCUMENTS.map((doc) => {
              return (
                <li key={doc}>
                  <Flex marginBottom="16px">
                    <Link to={`/${doc}`}>{doc}</Link>
                    <Button
                      onPress={async () => {
                        const res = await window.fetch(
                          `/api/v1/latest?document=${doc}`,
                          {
                            method: "GET",
                          }
                        );
                        if (!res.ok) {
                          ToastQueue.negative(
                            "An error occurred when fetching the latest response."
                          );
                          return;
                        }
                        const theJson = await res.json();
                        downloadJson(theJson);
                      }}
                      variant="primary"
                    >
                      Download
                    </Button>
                  </Flex>
                </li>
              );
            })}
          </ul>
        </Flex>
      </Route>
      <Route path="/:document">
        <DocumentRouter />
      </Route>
    </Flex>
  );
};

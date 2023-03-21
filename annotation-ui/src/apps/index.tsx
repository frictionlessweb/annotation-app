import React from "react";
import {
  Flex,
  Button,
  Picker,
  Tabs,
  TabList,
  Item,
  Text,
  Heading,
  ActionGroup,
  View,
} from "@adobe/react-spectrum";
import { March13 } from "./March13";
import { March20 } from './March20';

export const AnnotationRouter = () => {
  const week = new URLSearchParams(window.location.search).get("week");
  switch (week) {
    case "MARCH_20": {
      return <March20 />;
    }
    case "MARCH_13": {
      return <March13 />;
    }
    default: {
      return <March13 />;
    }
  }
};

import React from 'react';
import { render } from "@testing-library/react";
import { App } from "./App";

describe("Our app component", () => {
  test("Renders without crashing", () => {
    render(<App />);
  });
});

import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { App } from "./App";

describe("Our app component", () => {
  test("Renders without crashing", () => {
    render(<App />);
  });
  test("If you enter your name, you get pushed to the annotation app", async () => {
    const { getByTestId, queryByTestId } = render(<App />);
    const input = getByTestId("NAME");
    const button = getByTestId("GOTO_APP");
    fireEvent.click(button);
    expect(queryByTestId("ANNOTATION_APP")).toBeNull();
    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.click(button);
    });
    expect(queryByTestId("ANNOTATION_APP")).not.toBeNull();
  });
});

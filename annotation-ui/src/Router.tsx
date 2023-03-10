import { Route } from "wouter";
import { LogIn } from "./LogIn";

export const Router = () => {
  return (
    <>
      <Route path="/">
        <LogIn />
      </Route>
      <Route path="/:name">
        <p>Hello, John!</p>
      </Route>
    </>
  );
};

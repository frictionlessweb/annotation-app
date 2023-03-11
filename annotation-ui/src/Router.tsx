import { Route } from "wouter";
import { LogIn } from "./LogIn";
import { Annotations } from './Annotations';

export const Router = () => {
  return (
    <>
      <Route path="/">
        <LogIn />
      </Route>
      <Route path="/:name">
        <Annotations />
      </Route>
    </>
  );
};

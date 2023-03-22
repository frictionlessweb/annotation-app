import React from "react";
import { March20Provider } from "./March20Provider";
import { March20 as March20Core } from './March20';

export const March20 = () => {
  return (
    <March20Provider>
      <March20Core />
    </March20Provider>
  );
};

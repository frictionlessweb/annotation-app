import React from 'react';
import { Annotations } from './March13';
import { March13Provider } from './March13Provider';

export const March13 = () => {
  return (
    <March13Provider>
      <Annotations />
    </March13Provider>
  )
}

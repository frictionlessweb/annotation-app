import { Router } from './Router';
import { render } from '@testing-library/react';

describe("Our router component", () => {
  test("Renders without crashing", () => {
    render(<Router />);
  })
})

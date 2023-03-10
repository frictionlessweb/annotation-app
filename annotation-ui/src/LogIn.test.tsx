import { LogIn } from './LogIn';
import { render, fireEvent } from '@testing-library/react';

describe("Our log in component", () => {
  test("Pushes you to the right place if you enter in your name", () => {
    const { getByTestId } = render(<LogIn />);
    const input = getByTestId('NAME');
    const button = getByTestId('GOTO_APP');
  })
})

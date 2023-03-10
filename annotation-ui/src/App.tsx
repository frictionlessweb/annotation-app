import { Provider, defaultTheme, Flex, Heading } from "@adobe/react-spectrum";
import { Router } from "./Router";

export const App = () => {
  return (
    <Provider theme={defaultTheme}>
      <Router />
    </Provider>
  );
};

export default App;

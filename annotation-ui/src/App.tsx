import { Provider, defaultTheme } from "@adobe/react-spectrum";
import { ToastContainer } from '@react-spectrum/toast';
import { Router } from "./Router";

export const App = () => {
  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Router />
      <ToastContainer />
    </Provider>
  );
};

export default App;

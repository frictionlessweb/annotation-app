import { Route } from "wouter";
import { LogIn } from "./LogIn";
import { AdobeDocProvider } from "./DocumentProvider";
import { Annotations } from "./Annotations";
import { Flex } from '@adobe/react-spectrum';

export const Router = () => {
  return (
    <>
      <Route path="/">
        <LogIn />
      </Route>
      <Route path="/:name">
        <Flex width='100%' direction="column" data-testid="ANNOTATION_APP">
          <AdobeDocProvider>
            <Annotations />
          </AdobeDocProvider>
        </Flex>
      </Route>
    </>
  );
};

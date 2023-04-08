import React from "react";
import { Flex, Text } from "@adobe/react-spectrum";
import { Route, Link } from "wouter";
import { DocumentRouter } from "./DocumentRouter";

const DOCUMENTS = [
  "E0CEG1S47",
  "E0CMG4S162",
  "F100",
  "F46",
  "handbook_estate_planning_F132",
  "proposal_sales_proposal_F49",
  "agreement_professional_disclosure_statement_DR--256324984",
  "instructions_product_owner_manual_DR--338379095",
  "report_IBM_Whitepaper_on_AI_and_Business",
  "report_financial_spotify_report",
];

export const Router = () => {
  return (
    <Flex direction="column">
      <Route path="/">
        <Flex direction="column" margin="8px">
          <Text>Welcome!</Text>
          <Text>Please select a task:</Text>
          <ul>
            {DOCUMENTS.map((doc) => {
              return (
                <li key={doc}>
                  <Link to={`/${doc}`}>{doc}</Link>
                </li>
              );
            })}
          </ul>
        </Flex>
      </Route>
      <Route path="/:document">
        <DocumentRouter />
      </Route>
    </Flex>
  );
};

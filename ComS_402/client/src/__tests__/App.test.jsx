import React from "react";
import { render, cleanup } from "@testing-library/react";
 
import App from "../app";
 
afterEach(cleanup);
 
it("renders", () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});
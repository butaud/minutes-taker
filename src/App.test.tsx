import App from "./App";
import { render, screen } from "@testing-library/react";

describe("Simple working test", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Members in attendance:")).toBeInTheDocument();
  });
});

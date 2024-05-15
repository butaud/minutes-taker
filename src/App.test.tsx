import { App } from "./App";
import { render, screen } from "@testing-library/react";
import { SessionStore } from "./store/SessionStore";
import { resetSessionStore } from "./ui/test/util";

let sessionStore: SessionStore;

describe("Simple working test", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });
  it("renders without crashing", () => {
    render(<App store={sessionStore} />);
    expect(screen.getByText("Members in attendance:")).toBeInTheDocument();
  });
});

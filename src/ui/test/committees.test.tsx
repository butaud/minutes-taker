import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("committees", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the list of committees", () => {
    sessionStore.addCommittee({
      name: "Test Committee",
      type: "Board",
    });

    render(<App store={sessionStore} />);

    const header = screen.getByText("Active Committees");
    const committee = screen.getByText("Test Committee (Board)");
    expect(header).toPrecede(committee);
  });

  it("links to the committee doc if it exists", () => {
    sessionStore.updateCommitteeDocUrl("https://example.com");

    render(<App store={sessionStore} />);

    expect(
      screen.getByRole("link", { name: "(Committee Details)" })
    ).toHaveAttribute("href", "https://example.com");
  });

  it("doesn't link to the committee doc if it does not exist", () => {
    render(<App store={sessionStore} />);

    expect(
      screen.queryByRole("link", { name: "Committee Details" })
    ).not.toBeInTheDocument();
  });

  it("allows editing the committee doc url", async () => {
    expect.assertions(1);

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Active Committees"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Committee Details URL:"));
    await user.type(
      screen.getByLabelText("Committee Details URL:"),
      "https://example.com"
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByRole("link", { name: "(Committee Details)" })
    ).toHaveAttribute("href", "https://example.com");
  });

  it("allows adding a new committee", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Committee" }));
    await user.selectOptions(screen.getByLabelText("Committee Type"), "Board");
    await user.type(screen.getByLabelText("Committee Name"), "Test Committee");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Test Committee (Board)")).toBeInTheDocument();
  });

  it("allows removing a committee", async () => {
    expect.assertions(1);
    sessionStore.addCommittee({
      name: "Test Committee",
      type: "Board",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Committee (Board)"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("Test Committee")).not.toBeInTheDocument();
  });

  it("allows editing a committee name", async () => {
    expect.assertions(1);
    sessionStore.addCommittee({
      name: "Test Committee",
      type: "Board",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Committee (Board)"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Committee Name"));
    await user.type(
      screen.getByLabelText("Committee Name"),
      "Updated Committee"
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Updated Committee (Board)")).toBeInTheDocument();
  });

  it("allows editing a committee type", async () => {
    expect.assertions(1);
    sessionStore.addCommittee({
      name: "Test Committee",
      type: "Board",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Committee (Board)"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(
      screen.getByLabelText("Committee Type"),
      "Headmaster"
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Test Committee (Headmaster)")).toBeInTheDocument();
  });

  it("allows cancelling an edit", async () => {
    expect.assertions(1);
    sessionStore.addCommittee({
      name: "Test Committee",
      type: "Board",
    });

    render(<App store={sessionStore} />);

    await userEvent.hover(screen.getByText("Test Committee (Board)"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.clear(screen.getByLabelText("Committee Name"));
    await userEvent.type(
      screen.getByLabelText("Committee Name"),
      "Updated Committee"
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Test Committee (Board)")).toBeInTheDocument();
  });

  it("saves changes when enter is pressed", async () => {
    expect.assertions(1);
    sessionStore.addCommittee({
      name: "Test Committee",
      type: "Board",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Committee (Board)"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Committee Name"));
    await user.type(
      screen.getByLabelText("Committee Name"),
      "Updated Committee"
    );
    await user.keyboard("{enter}");

    expect(screen.getByText("Updated Committee (Board)")).toBeInTheDocument();
  });

  it("shows an error message if the new committee name is blank", async () => {
    expect.assertions(1);
    render(<App store={sessionStore} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Committee" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Name cannot be empty."
    );
  });
});

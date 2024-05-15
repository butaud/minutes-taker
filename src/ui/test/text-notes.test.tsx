import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("text notes", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the text of the note", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note",
    });
    render(<App store={sessionStore} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("allows editing the text of the note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note",
    });
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Note"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Text"), " edited");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Test Note edited")).toBeInTheDocument();
  });

  it("does not apply changes if cancel is clicked", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note",
    });
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Note"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Text"), " edited");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("shows an error if the text is empty", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note",
    });
    const user = userEvent.setup();
    render(<App store={sessionStore} />);
    await user.hover(screen.getByText("Test Note"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Text"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Text cannot be empty");
  });

  it("allows adding a new text note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Text Note" }));
    await user.type(screen.getByLabelText("Text"), "Test Note");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("allows cancelling a new text note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Text Note" }));
    await user.type(screen.getByLabelText("Text"), "Test Note");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Test Note")).not.toBeInTheDocument();
  });

  it("submits a new text note when enter is pressed", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Text Note" }));
    await user.type(screen.getByLabelText("Text"), "Test Note");
    await user.keyboard("{enter}");

    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("allows deleting a text note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Note"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("Test Note")).not.toBeInTheDocument();
  });
});

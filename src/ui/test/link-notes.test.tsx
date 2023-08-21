import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";

let sessionStore: SessionStore;

describe("link notes", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the link with text and URL", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com",
    });
    render(<SessionEditor session={sessionStore.session} />);
    expect(screen.getByRole("link", { name: "Test Link" })).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("allows editing the text of the link", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com",
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Test Link"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Text"), " edited");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByRole("link", { name: "Test Link edited" })
    ).toBeInTheDocument();
  });

  it("allows editing the URL of the link", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com/",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Link"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("URL"), "edited");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(screen.getByRole("link", { name: "Test Link" })).toHaveAttribute(
      "href",
      "https://example.com/edited"
    );
  });

  it("does not apply changes if cancel is clicked", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com/",
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Test Link"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Text"), " edited");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(screen.getByRole("link", { name: "Test Link" })).toBeInTheDocument();
  });

  it("shows an error if the text is empty", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com/",
    });
    const user = userEvent.setup();
    render(<SessionEditor session={sessionStore.session} />);
    await user.hover(screen.getByText("Test Link"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Text"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Text cannot be empty");
  });

  it("shows an error if the URL is empty", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com/",
    });

    const user = userEvent.setup();
    render(<SessionEditor session={sessionStore.session} />);
    await user.hover(screen.getByText("Test Link"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("URL"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("URL cannot be empty");
  });

  it("allows adding a new link note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Link Note" }));
    await user.type(screen.getByLabelText("Text"), "Test Link");
    await user.type(screen.getByLabelText("URL"), "https://example.com");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(screen.getByRole("link", { name: "Test Link" })).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("allows cancelling a new text note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Link Note" }));
    await user.type(screen.getByLabelText("Text"), "Test Link");
    await user.type(screen.getByLabelText("URL"), "https://example.com");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.queryByRole("link", { name: "Test Link" })
    ).not.toBeInTheDocument();
  });

  it("submits a new link note when enter is pressed", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Link Note" }));
    await user.type(screen.getByLabelText("Text"), "Test Link");
    await user.type(screen.getByLabelText("URL"), "https://example.com");
    await user.keyboard("{enter}");
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(screen.getByRole("link", { name: "Test Link" })).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("allows deleting a link note", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "link",
      text: "Test Link",
      url: "https://example.com/",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Test Link"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.queryByRole("link", { name: "Test Link" })
    ).not.toBeInTheDocument();
  });
});

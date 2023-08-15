import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";

let sessionStore: SessionStore;

describe("notes", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the list of notes under their topics", () => {
    sessionStore.addTopic({
      title: "Test Topic 1",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note 1",
    });
    sessionStore.addTopic({
      title: "Test Topic 2",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[1].id, {
      type: "text",
      text: "Test Note 2",
    });

    render(<SessionEditor session={sessionStore.session} />);

    const topic1Header = screen.getByText("Test Topic 1");
    const note1 = screen.getByText("Test Note 1");
    const topic2Header = screen.getByText("Test Topic 2");
    const note2 = screen.getByText("Test Note 2");

    expect(topic1Header).toPrecede(note1);
    expect(note1).toPrecede(topic2Header);
    expect(topic2Header).toPrecede(note2);
  });

  it("allows adding notes before other notes", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "text",
      text: "Test Note 1",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.keyDown(screen.getByText("Members in attendance:"), {
      key: "i",
      ctrlKey: true,
    });
    fireEvent.click(screen.getByLabelText("Add Note Inline"));

    fireEvent.click(
      screen.getAllByRole("button", { name: "Add Text Note" })[0]
    );
    await user.type(screen.getByLabelText("Text"), "Test Note 2");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<SessionEditor session={sessionStore.session} />);

    const note1 = screen.getByText("Test Note 1");
    const note2 = screen.getByText("Test Note 2");
    expect(note2).toPrecede(note1);
  });
  // adding and deleting notes covered by type-specific tests
  it.todo("allows reordering notes");
});

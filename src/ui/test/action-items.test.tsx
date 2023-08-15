import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import { getByTextContent } from "../../test/matchers";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";

let sessionStore: SessionStore;

describe("action items", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the assignee, text, and due date of an action item", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Test", lastName: "User" },
      dueDate: new Date("2021-01-01"),
      text: "Test Action Item",
    });

    render(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent("Action item: Mr. User to Test Action Item by 1/1/21.")
      )
    ).toBeInTheDocument();
  });

  it("allows editing the assignee of the action item", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User2",
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Test", lastName: "User" },
      dueDate: new Date("2021-01-01"),
      text: "Test Action Item",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Action item:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Assignee"), "Test User2");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent(
          "Action item: Mr. User2 to Test Action Item by 1/1/21."
        )
      )
    ).toBeInTheDocument();
  });

  it("allows editing the text of the action item", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Test", lastName: "User" },
      dueDate: new Date("2021-01-01"),
      text: "Test Action Item",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Action item:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Action item text"));
    await user.type(
      screen.getByLabelText("Action item text"),
      "Different Action Item"
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent(
          "Action item: Mr. User to Different Action Item by 1/1/21."
        )
      )
    ).toBeInTheDocument();
  });

  it("allows editing the due date of the action item", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Test", lastName: "User" },
      dueDate: new Date("2021-01-01"),
      text: "Test Action Item",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Action item:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2022-02-03" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent("Action item: Mr. User to Test Action Item by 2/3/22.")
      )
    ).toBeInTheDocument();
  });

  it("does not apply changes if cancel is clicked", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Test", lastName: "User" },
      dueDate: new Date("2021-01-01"),
      text: "Test Action Item",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Action item:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Action item text"));
    await user.type(
      screen.getByLabelText("Action item text"),
      "Different Action Item"
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent("Action item: Mr. User to Test Action Item by 1/1/21.")
      )
    ).toBeInTheDocument();
  });

  it("submits changes if enter is pressed", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });
    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Test", lastName: "User" },
      dueDate: new Date("2021-01-01"),
      text: "Test Action Item",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Action item:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Action item text"));
    await user.type(
      screen.getByLabelText("Action item text"),
      "Different Action Item"
    );
    await user.keyboard("{enter}");
    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent(
          "Action item: Mr. User to Different Action Item by 1/1/21."
        )
      )
    ).toBeInTheDocument();
  });

  it("allows adding a new action item", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Action Item" }));
    await user.selectOptions(screen.getByLabelText("Assignee"), "Test User");
    await user.type(
      screen.getByLabelText("Action item text"),
      "New Action Item"
    );
    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2022-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByText(
        getByTextContent("Action item: Mr. User to New Action Item by 1/1/22.")
      )
    ).toBeInTheDocument();
  });

  it("shows an error message if the new action item does not have text", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });

    const user = userEvent.setup();
    render(<SessionEditor session={sessionStore.session} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Action Item" }));
    await user.selectOptions(screen.getByLabelText("Assignee"), "Test User");
    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2022-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Action item text cannot be empty."
    );
  });

  it("shows an error message if the new action item does not have an assignee", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });

    const user = userEvent.setup();
    render(<SessionEditor session={sessionStore.session} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Action Item" }));
    await user.type(
      screen.getByLabelText("Action item text"),
      "New Action Item"
    );
    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2022-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Assignee cannot be empty."
    );
  });

  it("shows an error message if the new action item does not have a due date", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });

    const user = userEvent.setup();
    render(<SessionEditor session={sessionStore.session} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Action Item" }));
    await user.selectOptions(screen.getByLabelText("Assignee"), "Test User");
    await user.type(
      screen.getByLabelText("Action item text"),
      "New Action Item"
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Due date cannot be empty."
    );
  });

  it("allows cancelling the new action item", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Test",
      lastName: "User",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Action Item" }));
    await user.type(
      screen.getByLabelText("Action item text"),
      "New Action Item"
    );
    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2022-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    rerender(<SessionEditor session={sessionStore.session} />);
    expect(
      screen.getByRole("button", { name: "Add Action Item" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Action item:")).not.toBeInTheDocument();
  });
});

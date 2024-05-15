import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { getByTextContent } from "../../test/matchers";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("topics", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the list of topics", () => {
    sessionStore.addTopic({
      title: "Test Topic 1",
      startTime: new Date(),
      durationMinutes: 5,
    });
    sessionStore.addTopic({
      title: "Test Topic 2",
      startTime: new Date(),
      durationMinutes: 5,
    });

    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    expect(screen.getAllByText("Test Topic", { exact: false })).toHaveLength(2);
    sessionStore.addTopic({
      title: "Test Topic 3",
      startTime: new Date(),
      durationMinutes: 5,
    });
    rerender(<App store={sessionStore} />);
    expect(screen.getAllByText("Test Topic", { exact: false })).toHaveLength(3);
  });

  it("shows the topic title", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
    });

    render(<App store={sessionStore} />);

    expect(screen.getByText("Test Topic")).toBeInTheDocument();
  });

  it("shows the topic start time", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00Z"),
    });

    render(<App store={sessionStore} />);
    expect(screen.getByText("12:00 PM")).toBeInTheDocument();
  });

  it("shows the topic duration if it exists", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00Z"),
      durationMinutes: 5,
    });

    render(<App store={sessionStore} />);
    expect(screen.getByText("12:00 PM for 5 minutes")).toBeInTheDocument();
  });

  it("shows the topic leader if there is one", () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
      leader: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
    });
    render(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Lead by Mr. Jones"))
    ).toBeInTheDocument();
  });

  it("shows the correct topic leader title", () => {
    sessionStore.addMemberPresent({
      title: "Mrs.",
      firstName: "Mary",
      lastName: "Jones",
    });
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
      leader: { title: "Mrs.", firstName: "Mary", lastName: "Jones" },
    });
    render(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Lead by Mrs. Jones"))
    ).toBeInTheDocument();
  });

  it("allows editing the topic title", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "New Topic Title");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("New Topic Title")).toBeInTheDocument();
  });

  it("allows editing the topic start time", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00"),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Start Time"), {
      target: { value: "13:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("1:00 PM for 5 minutes")).toBeInTheDocument();
  });

  it("allows editing the topic duration", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00Z"),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Duration (minutes)"));
    await user.type(screen.getByLabelText("Duration (minutes)"), "10");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("12:00 PM for 10 minutes")).toBeInTheDocument();
  });

  it("allows editing the topic leader", async () => {
    expect.assertions(1);
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00"),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Leader"), "Bob Jones");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Lead by Mr. Jones"))
    ).toBeInTheDocument();
  });

  it("allows removing the topic leader", async () => {
    expect.assertions(1);
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00"),
      durationMinutes: 5,
      leader: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Leader"), "");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(
      screen.queryByText(getByTextContent("Lead by Mr. Jones"))
    ).not.toBeInTheDocument();
  });

  it("does not apply changes if cancel is clicked", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date("2020-01-01T12:00:00Z"),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Duration (minutes)"), {
      target: { valueAsNumber: 10 },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // for some reason this test is triggering the onSubmit for the form and it's saving even though it should cancel

    rerender(<App store={sessionStore} />);
    expect(screen.getByText("12:00 PM for 5 minutes")).toBeInTheDocument();
  });

  it("shows an error if the topic title is empty", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Title cannot be empty."
    );
  });

  it("saves the topic when the enter key is pressed", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Topic" }));
    await user.type(screen.getByLabelText("Title"), "Test Topic");
    await user.keyboard("{enter}");
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Test Topic")).toBeInTheDocument();
  });

  it("allows adding a topic", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Topic" }));
    await user.type(screen.getByLabelText("Title"), "Test Topic");
    await user.type(screen.getByLabelText("Duration (minutes)"), "5");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Test Topic")).toBeInTheDocument();
  });

  it("allows adding a topic before another topic", async () => {
    sessionStore.addTopic({
      title: "Existing Topic",
      startTime: new Date(),
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.keyDown(screen.getByText("Members in attendance:"), {
      key: "i",
      ctrlKey: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Topic Inline" }));
    await user.type(screen.getByLabelText("Title"), "New Topic");
    await user.type(screen.getByLabelText("Duration (minutes)"), "5");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);

    const existingTopic = screen.getByText("Existing Topic");
    const newTopic = screen.getByText("New Topic");
    expect(newTopic).toPrecede(existingTopic);
  });

  it("allows setting a topic's start time when it is added before another topic", async () => {
    sessionStore.addTopic({
      title: "Existing Topic",
      startTime: new Date("2020-01-01T12:00:00Z"),
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.keyDown(screen.getByText("Members in attendance:"), {
      key: "i",
      ctrlKey: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Topic Inline" }));
    await user.type(screen.getByLabelText("Title"), "New Topic");
    fireEvent.change(screen.getByLabelText("Start Time"), {
      target: { value: "13:00" },
    });
    await user.type(screen.getByLabelText("Duration (minutes)"), "5");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("1:00 PM for 5 minutes")).toBeInTheDocument();
  });

  it("automatically sets a new topic's start time to the previous topic's start + duration", async () => {
    const previousTopicStartTime = new Date("2020-01-01T12:00:00Z");
    sessionStore.addTopic({
      title: "Previous Topic",
      startTime: previousTopicStartTime,
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Topic" }));
    await user.type(screen.getByLabelText("Title"), "Test Topic");
    await user.type(screen.getByLabelText("Duration (minutes)"), "5");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);

    expect(screen.getByText(`12:05 PM for 5 minutes`)).toBeInTheDocument();
  });

  it("automatically sets a new topic's start time to the previous topic's start + duration when added inline", async () => {
    const previousTopicStartTime = new Date("2020-01-01T12:00:00Z");
    sessionStore.addTopic({
      title: "Previous Topic",
      startTime: previousTopicStartTime,
      durationMinutes: 5,
    });

    const nextTopicStartTime = new Date("2020-01-01T13:00:00Z");
    sessionStore.addTopic({
      title: "Next Topic",
      startTime: nextTopicStartTime,
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.keyDown(screen.getByText("Members in attendance:"), {
      key: "i",
      ctrlKey: true,
    });

    const middleInsertButton = screen.getByRole("button", {
      name: "Add Topic Inline",
      description: "Insert at position 1",
    });

    fireEvent.click(middleInsertButton);
    await user.type(screen.getByLabelText("Title"), "New Topic");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("12:05 PM")).toBeInTheDocument();
  });

  it("allows deleting a topic", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );
    await user.hover(screen.getByText("Test Topic"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    rerender(<App store={sessionStore} />);
    expect(screen.queryByText("Test Topic")).not.toBeInTheDocument();
  });

  it("allows sorting topics by start time", async () => {
    sessionStore.addTopic({
      title: "Topic 1",
      startTime: new Date("2020-01-01T12:00:00Z"),
      durationMinutes: 5,
    });
    sessionStore.addTopic({
      title: "Topic 2",
      startTime: new Date("2020-01-01T11:00:00Z"),
      durationMinutes: 5,
    });
    sessionStore.addTopic({
      title: "Topic 3",
      startTime: new Date("2020-01-01T13:00:00Z"),
      durationMinutes: 5,
    });

    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Sort Topics" }));
    rerender(<App store={sessionStore} />);

    const topic1 = screen.getByText("Topic 1");
    const topic2 = screen.getByText("Topic 2");
    const topic3 = screen.getByText("Topic 3");
    expect(topic2).toPrecede(topic1);
    expect(topic1).toPrecede(topic3);
  });

  it.todo("allows reordering topics");
});

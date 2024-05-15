import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { getByTextContent } from "../../test/matchers";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("motions", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the mover and text of the motion", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "withdrawn",
    });

    render(<App store={sessionStore} />);

    expect(
      screen.getByText(getByTextContent("Mr. Jones moved Test Motion"))
    ).toBeInTheDocument();
  });

  it("shows the seconder of the motion", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "withdrawn",
    });

    render(<App store={sessionStore} />);

    expect(
      screen.getByText(getByTextContent("Mr. Smith seconded."))
    ).toBeInTheDocument();
  });

  it("shows the status of the motion", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "withdrawn",
    });

    render(<App store={sessionStore} />);

    expect(
      screen.getByText(getByTextContent("The motion was withdrawn."))
    ).toBeInTheDocument();
  });

  it("shows the vote counts of the motion if it is passed", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "passed",
      inFavorCount: 2,
      opposedCount: 1,
      abstainedCount: 1,
    });

    render(<App store={sessionStore} />);

    expect(
      screen.getByText(
        getByTextContent("Vote: 2 in favor, 1 opposed, 1 abstained")
      )
    ).toBeInTheDocument();
  });

  it("omits empty vote count categories", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "passed",
      inFavorCount: 2,
      opposedCount: 0,
      abstainedCount: 1,
    });

    render(<App store={sessionStore} />);

    expect(
      screen.getByText(getByTextContent("Vote: 2 in favor, 1 abstained"))
    ).toBeInTheDocument();
  });

  it("shows the vote counts of the motion if it is failed", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "failed",
      inFavorCount: 1,
      opposedCount: 2,
    });

    render(<App store={sessionStore} />);

    expect(
      screen.getByText(getByTextContent("Vote: 1 in favor, 2 opposed"))
    ).toBeInTheDocument();
  });

  it("hides the vote counts if the motion is withdrawn", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "withdrawn",
      inFavorCount: 2,
      opposedCount: 1,
      abstainedCount: 1,
    });

    render(<App store={sessionStore} />);

    expect(screen.queryByText("Vote:")).not.toBeInTheDocument();
  });

  it("hides the vote counts if the motion is tabled", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "tabled",
      inFavorCount: 2,
      opposedCount: 1,
      abstainedCount: 1,
    });

    render(<App store={sessionStore} />);

    expect(screen.queryByText("Vote:")).not.toBeInTheDocument();
  });

  it("hides the vote counts if the motion is active", () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
      inFavorCount: 2,
      opposedCount: 1,
      abstainedCount: 1,
    });

    render(<App store={sessionStore} />);

    expect(screen.queryByText("Vote:")).not.toBeInTheDocument();
  });

  it("allows editing the mover of the motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Joe",
      lastName: "Brown",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Mover:"), "Joe Brown");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Mr. Brown")).toBeInTheDocument();
  });

  it("allows editing the seconder of the motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Joe",
      lastName: "Brown",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Seconder:"), "Joe Brown");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Brown seconded."))
    ).toBeInTheDocument();
  });

  it("allows editing the text of the motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Text:"));
    await user.type(screen.getByLabelText("Text:"), "Updated Motion");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Jones moved Updated Motion"))
    ).toBeInTheDocument();
  });

  it("allows editing the outcome of the motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Outcome:"), "passed");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Motion passed.")).toBeInTheDocument();
  });

  it("allows editing the vote counts if the motion is passed", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "passed",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("In favor:"), "10");
    await user.type(screen.getByLabelText("Opposed:"), "5");
    await user.type(screen.getByLabelText("Abstained:"), "1");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(
        getByTextContent("Vote: 10 in favor, 5 opposed, 1 abstained")
      )
    ).toBeInTheDocument();
  });

  it("allows editing the vote counts if the motion is failed", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "failed",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("In favor:"), "5");
    await user.type(screen.getByLabelText("Opposed:"), "7");
    await user.type(screen.getByLabelText("Abstained:"), "2");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(
        getByTextContent("Vote: 5 in favor, 7 opposed, 2 abstained")
      )
    ).toBeInTheDocument();
  });

  it("does not allow editing the vote counts if the motion is withdrawn", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "withdrawn",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByLabelText("In favor:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Opposed:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Abstained:")).not.toBeInTheDocument();
  });

  it("does not allow editing the vote counts if the motion is tabled", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "tabled",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByLabelText("In favor:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Opposed:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Abstained:")).not.toBeInTheDocument();
  });

  it("does not allow editing the vote counts if the motion is active", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByLabelText("In favor:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Opposed:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Abstained:")).not.toBeInTheDocument();
  });

  it("does not apply changes if cancel is clicked", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Text:"));
    await user.type(screen.getByLabelText("Text:"), "Updated Motion");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Jones moved Test Motion"))
    ).toBeInTheDocument();
  });

  it("submits changes if enter is pressed", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    sessionStore.addNote(sessionStore.session.topics[0].id, {
      type: "motion",
      mover: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      seconder: { title: "Mr.", firstName: "Tom", lastName: "Smith" },
      text: "Test Motion",
      outcome: "active",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Mr. Jones"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Text:"));
    await user.type(screen.getByLabelText("Text:"), "Updated Motion");
    await user.keyboard("{enter}");

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Jones moved Updated Motion"))
    ).toBeInTheDocument();
  });

  it("allows adding a new motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.click(screen.getByRole("button", { name: "Add Motion" }));
    await user.type(screen.getByLabelText("Text:"), "New Motion");
    await user.selectOptions(screen.getByLabelText("Mover:"), "Bob Jones");
    await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
    await user.selectOptions(screen.getByLabelText("Outcome:"), "tabled");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Jones moved New Motion"))
    ).toBeInTheDocument();
    expect(screen.getByText("The motion was tabled.")).toBeInTheDocument();
  });

  it("has a default outcome of active when adding a new motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.click(screen.getByRole("button", { name: "Add Motion" }));
    await user.type(screen.getByLabelText("Text:"), "New Motion");
    await user.selectOptions(screen.getByLabelText("Mover:"), "Bob Jones");
    await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Jones moved New Motion"))
    ).toBeInTheDocument();
    expect(
      screen.getByText("The motion is under discussion.")
    ).toBeInTheDocument();
  });

  it("shows an error message if the new motion does not have text", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.click(screen.getByRole("button", { name: "Add Motion" }));
    await user.selectOptions(screen.getByLabelText("Mover:"), "Bob Jones");
    await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Text is required.");
  });

  it("allows creating a motion with the default (first) mover", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.click(screen.getByRole("button", { name: "Add Motion" }));
    await user.type(screen.getByLabelText("Text:"), "New Motion");
    await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Jones moved New Motion"))
    ).toBeInTheDocument();
  });

  it("allows creating a motion with the default (first) seconder", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.click(screen.getByRole("button", { name: "Add Motion" }));
    await user.type(screen.getByLabelText("Text:"), "New Motion");
    await user.selectOptions(screen.getByLabelText("Mover:"), "Tom Smith");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);
    expect(
      screen.getByText(getByTextContent("Mr. Smith moved New Motion"))
    ).toBeInTheDocument();
  });

  it("allows cancelling a new motion", async () => {
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
    });

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Tom",
      lastName: "Smith",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.click(screen.getByRole("button", { name: "Add Motion" }));
    await user.type(screen.getByLabelText("Text:"), "New Motion");
    await user.selectOptions(screen.getByLabelText("Mover:"), "Bob Jones");
    await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByText("Mr. Jones moved New Motion")
    ).not.toBeInTheDocument();
  });
});

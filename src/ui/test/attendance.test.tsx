import { SessionStore } from "../../store/SessionStore";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { getByTextContent } from "../../test/matchers";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("attendance", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the list of members in attendance", () => {
    render(<App store={sessionStore} />);
    expect(screen.getByText("Members in attendance:")).toBeInTheDocument();

    act(() =>
      sessionStore.addMemberPresent({
        title: "Mr.",
        firstName: "Bob",
        lastName: "Smith",
      })
    );

    expect(
      screen.getByText(getByTextContent("Members in attendance: Smith"))
    ).toBeInTheDocument();

    act(() =>
      sessionStore.addMemberPresent({
        title: "Mr.",
        firstName: "Joe",
        lastName: "Williams",
      })
    );

    expect(
      screen.getByText(
        getByTextContent("Members in attendance: Smith, Williams")
      )
    ).toBeInTheDocument();
  });

  it("shows the list of members not in attendance", () => {
    render(<App store={sessionStore} />);
    expect(screen.getByText("Members not in attendance:")).toBeInTheDocument();

    act(() =>
      sessionStore.addMemberAbsent({
        title: "Mr.",
        firstName: "Bob",
        lastName: "Smith",
      })
    );

    expect(
      screen.getByText(getByTextContent("Members not in attendance: Smith"))
    ).toBeInTheDocument();

    act(() =>
      sessionStore.addMemberAbsent({
        title: "Mr.",
        firstName: "Joe",
        lastName: "Williams",
      })
    );

    expect(
      screen.getByText(
        getByTextContent("Members not in attendance: Smith, Williams")
      )
    ).toBeInTheDocument();
  });

  it("shows the administrators in attendance", () => {
    render(<App store={sessionStore} />);

    expect(screen.getByText("Administration:")).toBeInTheDocument();

    act(() =>
      sessionStore.addAdministrationPresent({
        title: "Mr.",
        firstName: "Bob",
        lastName: "Smith",
      })
    );

    expect(
      screen.getByText(getByTextContent("Administration: Smith"))
    ).toBeInTheDocument();

    act(() =>
      sessionStore.addAdministrationPresent({
        title: "Mr.",
        firstName: "Joe",
        lastName: "Williams",
      })
    );

    expect(
      screen.getByText(getByTextContent("Administration: Smith, Williams"))
    ).toBeInTheDocument();
  });

  it("shows the others referenced", () => {
    render(<App store={sessionStore} />);

    expect(screen.getByText("Others referenced:")).toBeInTheDocument();

    act(() =>
      sessionStore.addOtherReferenced({
        title: "Mr.",
        firstName: "Bob",
        lastName: "Smith",
      })
    );

    expect(
      screen.getByText(getByTextContent("Others referenced: Smith"))
    ).toBeInTheDocument();

    act(() =>
      sessionStore.addOtherReferenced({
        title: "Mr.",
        firstName: "Joe",
        lastName: "Williams",
      })
    );

    expect(
      screen.getByText(getByTextContent("Others referenced: Smith, Williams"))
    ).toBeInTheDocument();
  });

  it("allows adding members to attendance", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Members in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(
      screen.getByLabelText("Name to add to Members in attendance"),
      "Bob Jones"
    );
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.getByText(getByTextContent("Members in attendance: Jones"))
    ).toBeInTheDocument();
  });

  it("shows an error message if new member does not have first and last name", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Members in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(
      screen.getByLabelText("Name to add to Members in attendance"),
      "Bob"
    );
    await user.keyboard("{enter}");
    const errorMessage = await screen.findByRole("alert");
    expect(errorMessage).toHaveTextContent(
      "Please enter a first and last name."
    );
  });

  it("allows removing members from attendance", async () => {
    expect.assertions(1);

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Members in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const memberEntry = screen.getByText("Bob Jones");

    const removeButton = within(memberEntry).getByRole("button", {
      name: "Remove",
    });
    fireEvent.click(removeButton);
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Members in attendance: Jones"))
    ).not.toBeInTheDocument();
  });

  it("doesn't allow removing members from attendance if they are referenced in a note", async () => {
    expect.assertions(1);

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addTopic({
      title: "Test Topic",
      startTime: new Date(),
      durationMinutes: 5,
    });
    const testTopicId = sessionStore.session.topics[0].id;
    sessionStore.addNote(testTopicId, {
      type: "actionItem",
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      text: "Test Note",
      dueDate: new Date(),
    });

    const user = userEvent.setup();

    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Members in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const memberEntry = screen.getByText("Bob Jones");

    const removeButton = within(memberEntry).getByRole("button", {
      name: "Remove",
    });
    fireEvent.click(removeButton);
    const errorMessage = await screen.findByRole("alert");
    expect(errorMessage).toHaveTextContent(
      "This person is referenced in a note and cannot be removed."
    );
  });

  it("allows moving members from attendance to another category", async () => {
    expect.assertions(2);

    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);
    await user.hover(screen.getByText("Members in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await user.selectOptions(
      screen.getByLabelText("Move destination"),
      "Members not in attendance"
    );
    fireEvent.click(screen.getByRole("button", { name: "Move to" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Members in attendance: Jones"))
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(getByTextContent("Members not in attendance: Jones"))
    ).toBeInTheDocument();
  });

  it("allows adding members to not in attendance", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Members not in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(
      screen.getByLabelText("Name to add to Members not in attendance"),
      "Bob Jones"
    );
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.getByText(getByTextContent("Members not in attendance: Jones"))
    ).toBeInTheDocument();
  });

  it("allows removing members from not in attendance", async () => {
    expect.assertions(1);

    sessionStore.addMemberAbsent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Members not in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const memberEntry = screen.getByText("Bob Jones");

    const removeButton = within(memberEntry).getByRole("button", {
      name: "Remove",
    });
    fireEvent.click(removeButton);
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Members not in attendance: Jones"))
    ).not.toBeInTheDocument();
  });

  it("allows moving members from not in attendance to another category", async () => {
    expect.assertions(2);

    sessionStore.addMemberAbsent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);
    await user.hover(screen.getByText("Members not in attendance:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await user.selectOptions(
      screen.getByLabelText("Move destination"),
      "Members in attendance"
    );
    fireEvent.click(screen.getByRole("button", { name: "Move to" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Members not in attendance: Jones"))
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(getByTextContent("Members in attendance: Jones"))
    ).toBeInTheDocument();
  });

  it("allows adding administrators to attendance", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Administration:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(
      screen.getByLabelText("Name to add to Administration"),
      "Bob Jones"
    );
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.getByText(getByTextContent("Administration: Jones"))
    ).toBeInTheDocument();
  });

  it("allows removing administrators from attendance", async () => {
    expect.assertions(1);

    sessionStore.addAdministrationPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Administration:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const memberEntry = screen.getByText("Bob Jones");

    const removeButton = within(memberEntry).getByRole("button", {
      name: "Remove",
    });
    fireEvent.click(removeButton);
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Administration: Jones"))
    ).not.toBeInTheDocument();
  });

  it("allows moving administrators from attendance to another category", async () => {
    expect.assertions(2);

    sessionStore.addAdministrationPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);
    await user.hover(screen.getByText("Administration:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await user.selectOptions(
      screen.getByLabelText("Move destination"),
      "Others referenced"
    );
    fireEvent.click(screen.getByRole("button", { name: "Move to" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Administration: Jones"))
    ).not.toBeInTheDocument();
    expect(screen.getByText(getByTextContent("Others referenced: Jones")))
      .toBeInTheDocument;
  });

  it("allows adding others referenced", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Others referenced:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(
      screen.getByLabelText("Name to add to Others referenced"),
      "Bob Jones"
    );
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.getByText(getByTextContent("Others referenced: Jones"))
    ).toBeInTheDocument();
  });

  it("allows removing others referenced", async () => {
    expect.assertions(1);

    sessionStore.addOtherReferenced({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("Others referenced:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const memberEntry = screen.getByText("Bob Jones");

    const removeButton = within(memberEntry).getByRole("button", {
      name: "Remove",
    });
    fireEvent.click(removeButton);
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Others referenced: Jones"))
    ).not.toBeInTheDocument();
  });

  it("allows moving others referenced to another category", async () => {
    expect.assertions(2);

    sessionStore.addOtherReferenced({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    const user = userEvent.setup();
    render(<App store={sessionStore} />);
    await user.hover(screen.getByText("Others referenced:"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await user.selectOptions(
      screen.getByLabelText("Move destination"),
      "Members in attendance"
    );
    fireEvent.click(screen.getByRole("button", { name: "Move to" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

    expect(
      screen.queryByText(getByTextContent("Others referenced: Jones"))
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(getByTextContent("Members in attendance: Jones"))
    ).toBeInTheDocument();
  });
});

import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { getByTextContent } from "../../test/matchers";
import { App } from "../../App";

let sessionStore: SessionStore;

const findListItemByTextContent = (textContent: string) => {
  const allListItems = screen.getAllByRole("listitem");
  return allListItems.find((listitem) => listitem.textContent === textContent);
};

const getListItemByTextContent = (textContent: string) => {
  const allListItems = screen.getAllByRole("listitem");
  const found = allListItems.find(
    (listitem) => listitem.textContent === textContent
  );
  if (found === undefined) {
    screen.debug();
    const allText = allListItems
      .map((listitem) => listitem.textContent)
      .join("\n");
    throw new Error(
      `Could not find list item with text content "${textContent}". Found these items:\n${allText}`
    );
  }
  return found;
};

describe("listed action items", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("lists past action items", () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item 1",
      dueDate: new Date("2021-01-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: true,
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item 2",
      dueDate: new Date("2021-02-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: false,
    });

    render(<App store={sessionStore} />);

    const header = screen.getByText("Carried Forward Action Items");
    const actionItem1 = getListItemByTextContent(
      "Mr. Jones to Test Action Item 1 by 1/1/21. (Done)"
    );
    const actionItem2 = getListItemByTextContent(
      "Mr. Jones to Test Action Item 2 by 2/1/21. (Carry Forward)"
    );
    expect(header).toPrecede(actionItem1);
    expect(actionItem1).toPrecede(actionItem2);
  });

  it("lists session action items", () => {
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

    render(<App store={sessionStore} />);

    const header = screen.getByText("New Action Items");
    const actionItem = getListItemByTextContent(
      "Mr. User to Test Action Item by 1/1/21."
    );
    expect(header).toPrecede(actionItem);
  });

  it("allows adding a new past action item", async () => {
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
      "Test Action Item"
    );
    await user.selectOptions(screen.getByLabelText("Assignee"), "Test User");
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2021-01-01" },
    });
    fireEvent.click(screen.getByLabelText("Completed"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);

    expect(
      getListItemByTextContent("Mr. User to Test Action Item by 1/1/21. (Done)")
    ).toBeInTheDocument();
  });

  it("allows removing a past action item", async () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item 1",
      dueDate: new Date("2021-01-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: true,
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item 2",
      dueDate: new Date("2021-02-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: false,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(
      getListItemByTextContent(
        "Mr. Jones to Test Action Item 1 by 1/1/21. (Done)"
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    rerender(<App store={sessionStore} />);

    expect(
      findListItemByTextContent(
        "Mr. Jones to Test Action Item 1 by 1/1/21. (Done)"
      )
    ).toBeUndefined();

    expect(
      getListItemByTextContent(
        "Mr. Jones to Test Action Item 2 by 2/1/21. (Carry Forward)"
      )
    ).toBeInTheDocument();
  });

  it("does not allow editing a session action item", async () => {
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

    render(<App store={sessionStore} />);

    await userEvent.hover(
      screen.getByText(
        getByTextContent("Mr. User to Test Action Item by 1/1/21.")
      )
    );

    expect(
      screen.queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
  });

  it("allows editing a past action item assignee", async () => {
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
    sessionStore.addPastActionItem({
      text: "Test Action Item",
      dueDate: new Date("2021-01-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: false,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(
      screen.getByText(
        getByTextContent(
          "Mr. Jones to Test Action Item by 1/1/21. (Carry Forward)"
        )
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Assignee"), "Tom Smith");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);

    expect(
      screen.getByText(
        getByTextContent(
          "Mr. Smith to Test Action Item by 1/1/21. (Carry Forward)"
        )
      )
    ).toBeInTheDocument();
  });

  it("allows editing a past action item due date", async () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item",
      dueDate: new Date("2021-01-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: false,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(
      screen.getByText(
        getByTextContent(
          "Mr. Jones to Test Action Item by 1/1/21. (Carry Forward)"
        )
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2021-02-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);

    expect(
      screen.getByText(
        getByTextContent(
          "Mr. Jones to Test Action Item by 2/1/21. (Carry Forward)"
        )
      )
    ).toBeInTheDocument();
  });

  it("allows editing a past action item text", async () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item",
      dueDate: new Date("2021-01-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: false,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(
      screen.getByText(
        getByTextContent(
          "Mr. Jones to Test Action Item by 1/1/21. (Carry Forward)"
        )
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Action item text"));
    await user.type(
      screen.getByLabelText("Action item text"),
      "Updated Action Item"
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);

    expect(
      screen.getByText(
        getByTextContent(
          "Mr. Jones to Updated Action Item by 1/1/21. (Carry Forward)"
        )
      )
    ).toBeInTheDocument();
  });

  it("allows editing a past action item status", async () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.addPastActionItem({
      text: "Test Action Item",
      dueDate: new Date("2021-01-01"),
      assignee: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      completed: false,
    });

    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(
      screen.getByText(
        getByTextContent(
          "Mr. Jones to Test Action Item by 1/1/21. (Carry Forward)"
        )
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByLabelText("Completed"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    rerender(<App store={sessionStore} />);

    expect(
      screen.getByText(
        getByTextContent("Mr. Jones to Test Action Item by 1/1/21. (Done)")
      )
    ).toBeInTheDocument();
  });
});

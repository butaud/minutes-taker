import { SessionEditor } from "./SessionEditor";
import { SessionStore } from "../store/SessionStore";
import {
  render as origRender,
  screen,
  fireEvent,
  RenderOptions,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Session } from "minute-model";
import { ReactElement } from "react";
import { SessionProvider } from "./context/SessionStoreContext";
import { getByTextContent } from "../test/matchers";

const INITIAL_START_TIME = new Date(2000, 0, 1, 12, 0, 0);
const INITIAL_ORG_NAME = "Test Organization";
const INITIAL_MEETING_TITLE = "Test Meeting";
const INITIAL_MEETING_LOCATION = "Test Location";

const session: Session = {
  metadata: {
    organization: INITIAL_ORG_NAME,
    title: INITIAL_MEETING_TITLE,
    location: INITIAL_MEETING_LOCATION,
    startTime: INITIAL_START_TIME,
    membersPresent: [],
    membersAbsent: [],
    administrationPresent: [],
  },
  topics: [],
};

let sessionStore = new SessionStore(session);
const SessionStoreProvider = ({ children }: { children: ReactElement }) => (
  <SessionProvider sessionStore={sessionStore}>{children}</SessionProvider>
);

const render = (ui: ReactElement, options?: RenderOptions) =>
  origRender(ui, { wrapper: SessionStoreProvider, ...options });

describe("SessionEditor", () => {
  afterEach(() => {
    sessionStore = new SessionStore(session);
  });
  describe("metadata", () => {
    it("shows the organization name", () => {
      render(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        INITIAL_ORG_NAME
      );
    });

    it("shows the meeting title, location, and date/time", () => {
      render(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        `Test Meeting: Test Location, 1/1/00, 12:00 PM`
      );
    });

    it("allows editing the organization name", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByRole("heading", { level: 1 }));
      await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Organization"));
      await user.type(
        screen.getByLabelText("Organization"),
        "New Organization"
      );
      await fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "New Organization"
      );
    });

    it("allows editing the meeting title", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByRole("heading", { level: 2 }));
      await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Title"));
      await user.type(screen.getByLabelText("Title"), "New Meeting Title");
      await fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "New Meeting Title: Test Location, 1/1/00, 12:00 PM"
      );
    });

    it("allows editing the meeting location", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByRole("heading", { level: 2 }));
      await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Location"));
      await user.type(screen.getByLabelText("Location"), "New Location");
      await fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Test Meeting: New Location, 1/1/00, 12:00 PM"
      );
    });

    it("allows editing the meeting date and time", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByRole("heading", { level: 2 }));
      await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.change(screen.getByLabelText("Start time"), {
        target: { value: "2020-01-01 08:00:00" },
      });
      await fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Test Meeting: Test Location, 1/1/20, 8:00 AM"
      );
    });

    it("does not apply changes if cancel is clicked", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByRole("heading", { level: 2 }));
      await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Title"));
      await user.type(screen.getByLabelText("Title"), "New Meeting Title");
      await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Test Meeting: Test Location, 1/1/00, 12:00 PM"
      );
    });
  });

  describe("attendance", () => {
    it("shows the list of members in attendance", () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      expect(screen.getByText("Members in attendance:")).toBeInTheDocument();

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Smith" });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Members in attendance: Smith"))
      ).toBeInTheDocument();

      sessionStore.addMemberPresent({ firstName: "Joe", lastName: "Williams" });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(
          getByTextContent("Members in attendance: Smith, Williams")
        )
      ).toBeInTheDocument();
    });
    it("shows the list of members not in attendance", () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      expect(
        screen.getByText("Members not in attendance:")
      ).toBeInTheDocument();

      sessionStore.addMemberAbsent({
        firstName: "Bob",
        lastName: "Smith",
      });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Members not in attendance: Smith"))
      ).toBeInTheDocument();

      sessionStore.addMemberAbsent({
        firstName: "Joe",
        lastName: "Williams",
      });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(
          getByTextContent("Members not in attendance: Smith, Williams")
        )
      ).toBeInTheDocument();
    });
    it("shows the administrators in attendance", () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      expect(screen.getByText("Administration:")).toBeInTheDocument();

      sessionStore.addAdministrationPresent({
        firstName: "Bob",
        lastName: "Smith",
      });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Administration: Smith"))
      ).toBeInTheDocument();

      sessionStore.addAdministrationPresent({
        firstName: "Joe",
        lastName: "Williams",
      });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Administration: Smith, Williams"))
      ).toBeInTheDocument();
    });

    it("allows adding members to attendance", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Members in attendance:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(
        screen.getByLabelText("Add member to members in attendance list:"),
        "Bob Jones"
      );
      await user.keyboard("{enter}");
      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Members in attendance: Jones"))
      ).toBeInTheDocument();
    });
    it("shows an error message if new member does not have first and last name", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Members in attendance:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(
        screen.getByLabelText("Add member to members in attendance list:"),
        "Bob"
      );
      await user.keyboard("{enter}");
      const errorMessage = await screen.findByRole("alert");
      expect(errorMessage).toHaveTextContent(
        "Please enter a first and last name."
      );
      rerender(<SessionEditor session={sessionStore.session} />);
    });
    it("allows removing members from attendance", async () => {
      expect.assertions(1);

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByText("Members in attendance:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));

      const memberEntry = screen.getByText("Bob Jones");

      const removeButton = within(memberEntry).getByRole("button", {
        name: "Remove",
      });
      fireEvent.click(removeButton);
      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.queryByText(getByTextContent("Members in attendance: Jones"))
      ).not.toBeInTheDocument();
    });
    it("doesn't allow removing members from attendance if they are referenced in a note", async () => {
      expect.assertions(1);

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
        endTime: new Date(),
      });
      const testTopicId = sessionStore.session.topics[0].id;
      sessionStore.addNote(testTopicId, {
        type: "actionItem",
        assignee: { firstName: "Bob", lastName: "Jones" },
        text: "Test Note",
        dueDate: new Date(),
      });

      const user = userEvent.setup();

      render(<SessionEditor session={sessionStore.session} />);

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
    it("allows adding members to not in attendance", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Members not in attendance:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(
        screen.getByLabelText("Add member to members not in attendance list:"),
        "Bob Jones"
      );
      await user.keyboard("{enter}");
      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Members not in attendance: Jones"))
      ).toBeInTheDocument();
    });

    it("allows removing members from not in attendance", async () => {
      expect.assertions(1);

      sessionStore.addMemberAbsent({ firstName: "Bob", lastName: "Jones" });

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByText("Members not in attendance:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));

      const memberEntry = screen.getByText("Bob Jones");

      const removeButton = within(memberEntry).getByRole("button", {
        name: "Remove",
      });
      fireEvent.click(removeButton);
      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.queryByText(getByTextContent("Members not in attendance: Jones"))
      ).not.toBeInTheDocument();
    });

    it("allows adding administrators to attendance", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Administration:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(
        screen.getByLabelText("Add member to administration list:"),
        "Bob Jones"
      );
      await user.keyboard("{enter}");
      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Administration: Jones"))
      ).toBeInTheDocument();
    });
    it("allows removing administrators from attendance", async () => {
      expect.assertions(1);

      sessionStore.addAdministrationPresent({
        firstName: "Bob",
        lastName: "Jones",
      });

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByText("Administration:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));

      const memberEntry = screen.getByText("Bob Jones");

      const removeButton = within(memberEntry).getByRole("button", {
        name: "Remove",
      });
      fireEvent.click(removeButton);
      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.queryByText(getByTextContent("Administration: Jones"))
      ).not.toBeInTheDocument();
    });
  });

  describe("topics", () => {
    it.todo("shows the list of topics");
    it.todo("shows the topic title");
    it.todo("shows the topic start time");
    it.todo("shows the topic duration");
    it.todo("allows editing the topic title");
    it.todo("allows editing the topic start time");
    it.todo("allows editing the topic duration");
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a topic");
    it.todo("automatically sets a new topic's start time to the current time");
    it.todo("automatically sets the previous topic's duration");
    it.todo("allows deleting a topic");
    it.todo("allows reordering topics");
  });

  describe("notes", () => {
    it.todo("shows the list of notes under a topic");
    it.todo("allows adding a note");
    it.todo("allows deleting a note");
    it.todo("allows reordering notes");
  });

  describe("text notes", () => {
    it.todo("shows the text of the note");
    it.todo("allows editing the text of the note");
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a new text note");
    it.todo("allows cancelling a new text note");
  });

  describe("action items", () => {
    it.todo("shows the assignee of the action item");
    it.todo("shows the text of the action item");
    it.todo("shows the due date of the action item if it has one");
    it.todo("allows editing the assignee of the action item");
    it.todo("allows editing the text of the action item");
    it.todo("allows editing the due date of the action item");
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a new action item");
    it.todo("shows an error message if the new action item does not have text");
    it.todo(
      "shows an error message if the new action item does not have an assignee"
    );
    it.todo("allows cancelling a new action item");
  });

  describe("motions", () => {
    it.todo("shows the mover of the motion");
    it.todo("shows the seconder of the motion");
    it.todo("shows the text of the motion");
    it.todo("shows the status of the motion");
    it.todo("shows the vote counts of the motion if it is passed or failed");
    it.todo("allows editing the mover of the motion");
    it.todo("allows editing the seconder of the motion");
    it.todo("allows editing the text of the motion");
    it.todo("allows editing the status of the motion");
    it.todo(
      "allows editing the vote counts of the motion if it is passed or failed"
    );
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a new motion");
    it.todo("shows an error message if the new motion does not have text");
    it.todo("shows an error message if the new motion does not have a mover");
    it.todo(
      "shows an error message if the new motion does not have a seconder"
    );
    it.todo("allows cancelling a new motion");
  });
  describe("overall", () => {
    it.todo("allows undoing changes");
    it.todo("allows redoing undone changes");
    it.todo("clears redo history when a new change is made");
  });
});

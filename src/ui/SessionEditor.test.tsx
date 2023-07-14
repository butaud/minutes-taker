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
import { Session } from "minutes-model";
import { ReactElement } from "react";
import { SessionProvider } from "./context/SessionStoreContext";
import { getByTextContent } from "../test/matchers";
import { PersonListContext } from "./context/PersonListContext";

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
let personList = sessionStore.allPeople;
const AllProviders = ({ children }: { children: ReactElement }) => (
  <SessionProvider sessionStore={sessionStore}>
    <PersonListContext.Provider value={personList}>
      {children}
    </PersonListContext.Provider>
  </SessionProvider>
);

const render = (ui: ReactElement, options?: RenderOptions) =>
  origRender(ui, { wrapper: AllProviders, ...options });

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
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
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
        durationMinutes: 5,
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

      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
      sessionStore.addTopic({
        title: "Test Topic 3",
        startTime: new Date(),
        durationMinutes: 5,
      });
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    });

    it("shows the topic title", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
        durationMinutes: 5,
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Test Topic"
      );
    });

    it("shows the topic start time", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date("2020-01-01T12:00:00"),
      });

      render(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("12:00 PM")).toBeInTheDocument();
    });

    it("shows the topic duration if it exists", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date("2020-01-01T12:00:00"),
        durationMinutes: 5,
      });

      render(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("12:00 PM for 5 minutes")).toBeInTheDocument();
    });

    it("shows the topic leader if there is one", () => {
      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
        durationMinutes: 5,
        leader: { firstName: "Bob", lastName: "Jones" },
      });
      render(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Lead by Mr. Jones"))
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

      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Title"));
      await user.type(screen.getByLabelText("Title"), "New Topic Title");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "New Topic Title"
      );
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

      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.change(screen.getByLabelText("Start Time"), {
        target: { value: "13:00" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("1:00 PM for 5 minutes")).toBeInTheDocument();
    });

    it("allows editing the topic duration", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date("2020-01-01T12:00:00"),
        durationMinutes: 5,
      });

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Duration (minutes)"));
      await user.type(screen.getByLabelText("Duration (minutes)"), "10");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("12:00 PM for 10 minutes")).toBeInTheDocument();
    });

    it("allows editing the topic leader", async () => {
      expect.assertions(1);
      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date("2020-01-01T12:00:00"),
        durationMinutes: 5,
      });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Leader"), "Bob Jones");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Lead by Mr. Jones"))
      ).toBeInTheDocument();
    });

    it("allows removing the topic leader", async () => {
      expect.assertions(1);
      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date("2020-01-01T12:00:00"),
        durationMinutes: 5,
        leader: { firstName: "Bob", lastName: "Jones" },
      });
      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Leader"), "");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.queryByText(getByTextContent("Lead by Mr. Jones"))
      ).not.toBeInTheDocument();
    });

    it("does not apply changes if cancel is clicked", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date("2020-01-01T12:00:00"),
        durationMinutes: 5,
      });

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.change(screen.getByLabelText("Duration (minutes)"), {
        target: { valueAsNumber: 10 },
      });
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      // for some reason this test is triggering the onSubmit for the form and it's saving even though it should cancel

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("12:00 PM for 5 minutes")).toBeInTheDocument();
    });

    it("shows an error if the topic title is empty", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
        durationMinutes: 5,
      });

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

      await user.hover(screen.getByRole("heading", { level: 3 }));
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
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Test Topic"
      );
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
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Test Topic"
      );
    });

    it("automatically sets a new topic's start time to the current time", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Add Topic" }));
      await user.type(screen.getByLabelText("Title"), "Test Topic");
      await user.type(screen.getByLabelText("Duration (minutes)"), "5");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);

      const nowTime = new Date();
      const nowTimeString = nowTime.toLocaleTimeString([], {
        timeStyle: "short",
      });
      expect(
        screen.getByText(`${nowTimeString} for 5 minutes`)
      ).toBeInTheDocument();
    });

    it("automatically sets the previous topic's duration", async () => {
      const previousTopicStartTime = new Date(
        new Date().getTime() - 1000 * 60 * 25
      );
      sessionStore.addTopic({
        title: "Previous Topic",
        startTime: previousTopicStartTime,
      });

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Add Topic" }));
      await user.type(screen.getByLabelText("Title"), "Test Topic");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText("for 25 minutes", { exact: false })
      ).toBeInTheDocument();
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
      await user.hover(screen.getByRole("heading", { level: 3 }));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.queryByText("Test Topic")).not.toBeInTheDocument();
    });

    it.todo("allows reordering topics");
  });

  describe("notes", () => {
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

      const topic1Header = screen.getByRole("heading", {
        name: "Test Topic 1",
      });
      const note1 = screen.getByText("Test Note 1");
      const topic2Header = screen.getByRole("heading", {
        name: "Test Topic 2",
      });
      const note2 = screen.getByText("Test Note 2");

      expect(topic1Header).toPrecede(note1);
      expect(note1).toPrecede(topic2Header);
      expect(topic2Header).toPrecede(note2);
    });
    // adding and deleting notes covered by type-specific tests
    it.todo("allows reordering notes");
  });

  describe("text notes", () => {
    it("shows the text of the note", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "text",
        text: "Test Note",
      });
      render(<SessionEditor session={sessionStore.session} />);
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
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByText("Test Note"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(screen.getByLabelText("Text"), " edited");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
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
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByText("Test Note"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(screen.getByLabelText("Text"), " edited");
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      rerender(<SessionEditor session={sessionStore.session} />);
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
      render(<SessionEditor session={sessionStore.session} />);
      await user.hover(screen.getByText("Test Note"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Text"));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Text cannot be empty"
      );
    });

    it("allows adding a new text note", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      fireEvent.click(screen.getByRole("button", { name: "Add Text Note" }));
      await user.type(screen.getByLabelText("Text"), "Test Note");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Test Note")).toBeInTheDocument();
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

      fireEvent.click(screen.getByRole("button", { name: "Add Text Note" }));
      await user.type(screen.getByLabelText("Text"), "Test Note");
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.queryByText("Test Note")).not.toBeInTheDocument();
    });

    it("submits a new text note when enter is pressed", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      fireEvent.click(screen.getByRole("button", { name: "Add Text Note" }));
      await user.type(screen.getByLabelText("Text"), "Test Note");
      await user.keyboard("{enter}");
      rerender(<SessionEditor session={sessionStore.session} />);
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
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByText("Test Note"));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.queryByText("Test Note")).not.toBeInTheDocument();
    });
  });

  describe("action items", () => {
    it("shows the assignee, text, and due date of an action item", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "actionItem",
        assignee: { firstName: "Test", lastName: "User" },
        dueDate: new Date("2021-01-01"),
        text: "Test Action Item",
      });

      render(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(
          getByTextContent(
            "Action item: Mr. User to Test Action Item by 1/1/2021."
          )
        )
      ).toBeInTheDocument();
    });

    it("allows editing the assignee of the action item", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User2" });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "actionItem",
        assignee: { firstName: "Test", lastName: "User" },
        dueDate: new Date("2021-01-01"),
        text: "Test Action Item",
      });

      personList = sessionStore.allPeople;

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
            "Action item: Mr. User2 to Test Action Item by 1/1/2021."
          )
        )
      ).toBeInTheDocument();
    });

    it("allows editing the text of the action item", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "actionItem",
        assignee: { firstName: "Test", lastName: "User" },
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
            "Action item: Mr. User to Different Action Item by 1/1/2021."
          )
        )
      ).toBeInTheDocument();
    });

    it("allows editing the due date of the action item", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "actionItem",
        assignee: { firstName: "Test", lastName: "User" },
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
          getByTextContent(
            "Action item: Mr. User to Test Action Item by 2/3/2022."
          )
        )
      ).toBeInTheDocument();
    });

    it("does not apply changes if cancel is clicked", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "actionItem",
        assignee: { firstName: "Test", lastName: "User" },
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
          getByTextContent(
            "Action item: Mr. User to Test Action Item by 1/1/2021."
          )
        )
      ).toBeInTheDocument();
    });

    it("submits changes if enter is pressed", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "actionItem",
        assignee: { firstName: "Test", lastName: "User" },
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
            "Action item: Mr. User to Different Action Item by 1/1/2021."
          )
        )
      ).toBeInTheDocument();
    });

    it("allows adding a new action item", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });

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
          getByTextContent(
            "Action item: Mr. User to New Action Item by 1/1/2022."
          )
        )
      ).toBeInTheDocument();
    });

    it("shows an error message if the new action item does not have text", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });

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
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });

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
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });

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
      sessionStore.addMemberPresent({ firstName: "Test", lastName: "User" });

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
    it.todo("submits changes if enter is pressed");
    it.todo("cancels changes if escape is pressed");
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

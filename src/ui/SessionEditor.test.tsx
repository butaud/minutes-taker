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
const INTITIAL_MEETING_SUBTITLE = "Test Subtitle";
const INITIAL_MEETING_LOCATION = "Test Location";

const session: Session = {
  metadata: {
    organization: INITIAL_ORG_NAME,
    title: INITIAL_MEETING_TITLE,
    subtitle: INTITIAL_MEETING_SUBTITLE,
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

    it("shows the meeting title, subtitle, location, and date/time", () => {
      render(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        `Test Meeting - Test Subtitle: Test Location, 1/1/00, 12:00 PM`
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
        "New Meeting Title - Test Subtitle: Test Location, 1/1/00, 12:00 PM"
      );
    });

    it("allows editing the meeting subtitle", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await user.hover(screen.getByRole("heading", { level: 2 }));
      await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Subtitle"));
      await user.type(
        screen.getByLabelText("Subtitle"),
        "New Meeting Subtitle"
      );
      await fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Test Meeting - New Meeting Subtitle: Test Location, 1/1/00, 12:00 PM"
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
        "Test Meeting - Test Subtitle: New Location, 1/1/00, 12:00 PM"
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
        "Test Meeting - Test Subtitle: Test Location, 1/1/20, 8:00 AM"
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
        "Test Meeting - Test Subtitle: Test Location, 1/1/00, 12:00 PM"
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
        screen.getByLabelText("Add member to members in attendance:"),
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
        screen.getByLabelText("Add member to members in attendance:"),
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
        screen.getByLabelText("Add member to members not in attendance:"),
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
        screen.getByLabelText("Add member to administration:"),
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

  describe("caller", () => {
    it("shows the caller", () => {
      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.updateCaller({
        person: { firstName: "Bob", lastName: "Jones" },
        role: "Test Role",
      });
      render(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(
          getByTextContent("Mr. Jones, Test Role, called the meeting to order.")
        )
      ).toBeInTheDocument();
    });

    it("shows default text if there is no caller", () => {
      render(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText("The meeting was called to order.")
      ).toBeInTheDocument();
    });

    it("allows editing the caller", async () => {
      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });

      personList = sessionStore.allPeople;

      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("The meeting was called to order."));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Caller"), "Bob Jones");
      await user.type(screen.getByLabelText("Role"), "Test Role");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(
          getByTextContent("Mr. Jones, Test Role, called the meeting to order.")
        )
      ).toBeInTheDocument();
    });

    it("allows removing the caller", async () => {
      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.updateCaller({
        person: { firstName: "Bob", lastName: "Jones" },
        role: "Test Role",
      });
      expect.assertions(1);
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(
        screen.getByText(
          getByTextContent("Mr. Jones, Test Role, called the meeting to order.")
        )
      );
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Caller"), "");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText("The meeting was called to order.")
      ).toBeInTheDocument();
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
      rerender(<SessionEditor session={sessionStore.session} />);

      const existingTopic = screen.getByText("Existing Topic");
      const newTopic = screen.getByText("New Topic");
      expect(newTopic).toPrecede(existingTopic);
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
    it("shows the mover and text of the motion", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "withdrawn",
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.getByText(getByTextContent("Mr. Jones moved Test Motion"))
      ).toBeInTheDocument();
    });

    it("shows the seconder of the motion", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "withdrawn",
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.getByText(getByTextContent("Mr. Smith seconded."))
      ).toBeInTheDocument();
    });

    it("shows the status of the motion", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "withdrawn",
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.getByText(getByTextContent("The motion was withdrawn."))
      ).toBeInTheDocument();
    });

    it("shows the vote counts of the motion if it is passed", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "passed",
        inFavorCount: 2,
        opposedCount: 1,
        abstainedCount: 1,
      });

      render(<SessionEditor session={sessionStore.session} />);

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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "passed",
        inFavorCount: 2,
        opposedCount: 0,
        abstainedCount: 1,
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.getByText(getByTextContent("Vote: 2 in favor, 1 abstained"))
      ).toBeInTheDocument();
    });

    it("shows the vote counts of the motion if it is failed", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "failed",
        inFavorCount: 1,
        opposedCount: 2,
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.getByText(getByTextContent("Vote: 1 in favor, 2 opposed"))
      ).toBeInTheDocument();
    });

    it("hides the vote counts if the motion is withdrawn", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "withdrawn",
        inFavorCount: 2,
        opposedCount: 1,
        abstainedCount: 1,
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(screen.queryByText("Vote:")).not.toBeInTheDocument();
    });

    it("hides the vote counts if the motion is tabled", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "tabled",
        inFavorCount: 2,
        opposedCount: 1,
        abstainedCount: 1,
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(screen.queryByText("Vote:")).not.toBeInTheDocument();
    });

    it("hides the vote counts if the motion is active", () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
        inFavorCount: 2,
        opposedCount: 1,
        abstainedCount: 1,
      });

      render(<SessionEditor session={sessionStore.session} />);

      expect(screen.queryByText("Vote:")).not.toBeInTheDocument();
    });

    it("allows editing the mover of the motion", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });
      sessionStore.addMemberPresent({ firstName: "Joe", lastName: "Brown" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
      });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Mr. Jones"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Mover:"), "Joe Brown");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Mr. Brown")).toBeInTheDocument();
    });

    it("allows editing the seconder of the motion", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });
      sessionStore.addMemberPresent({ firstName: "Joe", lastName: "Brown" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
      });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Mr. Jones"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Seconder:"), "Joe Brown");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Mr. Brown seconded."))
      ).toBeInTheDocument();
    });

    it("allows editing the text of the motion", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
      });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Mr. Jones"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Text:"));
      await user.type(screen.getByLabelText("Text:"), "Updated Motion");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Mr. Jones moved Updated Motion"))
      ).toBeInTheDocument();
    });

    it("allows editing the outcome of the motion", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
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

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Motion passed.")).toBeInTheDocument();
    });

    it("allows editing the vote counts if the motion is passed", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
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

      rerender(<SessionEditor session={sessionStore.session} />);
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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
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

      rerender(<SessionEditor session={sessionStore.session} />);
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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "withdrawn",
      });

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "tabled",
      });

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
      });

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
      });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Mr. Jones"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Text:"));
      await user.type(screen.getByLabelText("Text:"), "Updated Motion");
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Mr. Jones moved Test Motion"))
      ).toBeInTheDocument();
    });

    it("submits changes if enter is pressed", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "motion",
        mover: { firstName: "Bob", lastName: "Jones" },
        seconder: { firstName: "Tom", lastName: "Smith" },
        text: "Test Motion",
        outcome: "active",
      });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.hover(screen.getByText("Mr. Jones"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.clear(screen.getByLabelText("Text:"));
      await user.type(screen.getByLabelText("Text:"), "Updated Motion");
      await user.keyboard("{enter}");

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(
        screen.getByText(getByTextContent("Mr. Jones moved Updated Motion"))
      ).toBeInTheDocument();
    });

    it("allows adding a new motion", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      personList = sessionStore.allPeople;

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

      rerender(<SessionEditor session={sessionStore.session} />);
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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.click(screen.getByRole("button", { name: "Add Motion" }));
      await user.type(screen.getByLabelText("Text:"), "New Motion");
      await user.selectOptions(screen.getByLabelText("Mover:"), "Bob Jones");
      await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
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

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

      await user.click(screen.getByRole("button", { name: "Add Motion" }));
      await user.selectOptions(screen.getByLabelText("Mover:"), "Bob Jones");
      await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(screen.getByRole("alert")).toHaveTextContent("Text is required.");
    });

    it("shows an error message if the new motion does not have a mover", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

      await user.click(screen.getByRole("button", { name: "Add Motion" }));
      await user.type(screen.getByLabelText("Text:"), "New Motion");
      await user.selectOptions(screen.getByLabelText("Seconder:"), "Tom Smith");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(screen.getByRole("alert")).toHaveTextContent("Mover is required.");
    });

    it("shows an error message if the new motion does not have a seconder", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

      await user.click(screen.getByRole("button", { name: "Add Motion" }));
      await user.type(screen.getByLabelText("Text:"), "New Motion");
      await user.selectOptions(screen.getByLabelText("Mover:"), "Tom Smith");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Seconder is required."
      );
    });

    it("allows cancelling a new motion", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });

      sessionStore.addMemberPresent({ firstName: "Bob", lastName: "Jones" });
      sessionStore.addMemberPresent({ firstName: "Tom", lastName: "Smith" });

      personList = sessionStore.allPeople;

      const user = userEvent.setup();
      render(<SessionEditor session={sessionStore.session} />);

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

  describe("overall", () => {
    it("allows undoing changes", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.click(screen.getByRole("button", { name: "Add Topic" }));
      await user.type(screen.getByLabelText("Title"), "Test Topic");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Test Topic")).toBeInTheDocument();

      await user.hover(screen.getByText("Members in attendance:"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.type(
        screen.getByLabelText("Add member to members in attendance:"),
        "Bob Jones"
      );
      await user.keyboard("{enter}");
      await user.type(
        screen.getByLabelText("Add member to members in attendance:"),
        "Tom Smith"
      );
      await user.keyboard("{enter}");

      fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

      personList = sessionStore.allPeople;

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Jones, Smith")).toBeInTheDocument();

      await user.hover(screen.getByText("Test Topic"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await user.selectOptions(screen.getByLabelText("Leader"), "Bob Jones");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.getByText(getByTextContent("Lead by Mr. Jones"))
      ).toBeInTheDocument();

      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "z",
        ctrlKey: true,
      });
      rerender(<SessionEditor session={sessionStore.session} />);

      expect(
        screen.queryByText(getByTextContent("Lead by Mr. Jones"))
      ).not.toBeInTheDocument();

      // undo each member add
      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "z",
        ctrlKey: true,
      });
      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "z",
        ctrlKey: true,
      });
      rerender(<SessionEditor session={sessionStore.session} />);

      expect(screen.queryByText("Jones, Smith")).not.toBeInTheDocument();

      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "z",
        ctrlKey: true,
      });
      rerender(<SessionEditor session={sessionStore.session} />);

      expect(screen.queryByText("Test Topic")).not.toBeInTheDocument();
    });

    it("allows redoing undone changes", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await user.click(screen.getByRole("button", { name: "Add Topic" }));
      await user.type(screen.getByLabelText("Title"), "Test Topic");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Test Topic")).toBeInTheDocument();

      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "z",
        ctrlKey: true,
      });

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.queryByText("Test Topic")).not.toBeInTheDocument();

      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "y",
        ctrlKey: true,
      });

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Test Topic")).toBeInTheDocument();
    });

    it("clears redo history when a new change is made", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      // create a topic
      await user.click(screen.getByRole("button", { name: "Add Topic" }));
      await user.type(screen.getByLabelText("Title"), "Test Topic");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.getByText("Test Topic")).toBeInTheDocument();

      // undo creating the topic
      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "z",
        ctrlKey: true,
      });

      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.queryByText("Test Topic")).not.toBeInTheDocument();

      // create a new topic
      await user.click(screen.getByRole("button", { name: "Add Topic" }));
      await user.type(screen.getByLabelText("Title"), "Test Topic 2");
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      // try to redo creating the first topic
      fireEvent.keyDown(screen.getByText("Members in attendance:"), {
        key: "y",
        ctrlKey: true,
      });

      // redo should not occur
      rerender(<SessionEditor session={sessionStore.session} />);
      expect(screen.queryByText("Test Topic")).not.toBeInTheDocument();
    });
  });
});

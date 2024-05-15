import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("metadata", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore({
      metadata: {
        organization: "Test Organization",
        title: "Test Meeting",
        subtitle: "Test Subtitle",
        location: "Test Location",
        startTime: new Date("2000-01-01T12:00:00Z"),
        membersPresent: [],
        membersAbsent: [],
        administrationPresent: [],
        othersReferenced: [],
      },
    });
  });

  it("shows the organization name", () => {
    render(<App store={sessionStore} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Test Organization"
    );
  });

  it("shows the meeting title, subtitle, location, and date/time", () => {
    render(<App store={sessionStore} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      `Test Meeting - Test Subtitle: Test Location, 1/1/00, 12:00 PM`
    );
  });

  it("allows editing the organization name", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByRole("heading", { level: 1 }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Organization"));
    await user.type(screen.getByLabelText("Organization"), "New Organization");
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "New Organization"
    );
  });

  it("allows editing the meeting title", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByRole("heading", { level: 2 }));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "New Meeting Title");
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "New Meeting Title - Test Subtitle: Test Location, 1/1/00, 12:00 PM"
    );
  });

  it("allows editing the meeting subtitle", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByRole("heading", { level: 2 }));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Subtitle"));
    await user.type(screen.getByLabelText("Subtitle"), "New Meeting Subtitle");
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Test Meeting - New Meeting Subtitle: Test Location, 1/1/00, 12:00 PM"
    );
  });

  it("allows editing the meeting location", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByRole("heading", { level: 2 }));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Location"));
    await user.type(screen.getByLabelText("Location"), "New Location");
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Test Meeting - Test Subtitle: New Location, 1/1/00, 12:00 PM"
    );
  });

  it("allows editing the meeting date and time", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByRole("heading", { level: 2 }));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "2020-01-01 08:00:00" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Test Meeting - Test Subtitle: Test Location, 1/1/20, 8:00 AM"
    );
  });

  it("does not apply changes if cancel is clicked", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByRole("heading", { level: 2 }));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "New Meeting Title");
    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Test Meeting - Test Subtitle: Test Location, 1/1/00, 12:00 PM"
    );
  });
});

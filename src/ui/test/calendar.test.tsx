import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("calendar", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows empty months if there are no calendar items for that month", () => {
    sessionStore.addCalendarMonth("September", 0);
    render(<App store={sessionStore} />);

    expect(screen.getByText("Board Calendar Items")).toBeInTheDocument();
    expect(screen.getByText("September")).toBeInTheDocument();
  });

  it("shows calendar items for each month", () => {
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item",
      completed: false,
    });
    sessionStore.addCalendarMonth("October", 1);
    sessionStore.addCalendarItem("October", {
      text: "Test Calendar Item 2",
      completed: false,
    });

    render(<App store={sessionStore} />);

    const septMonth = screen.getByText("September");
    const octMonth = screen.getByText("October");
    const septCalendarItem = screen.getByText("Test Calendar Item");
    const octCalendarItem = screen.getByText("Test Calendar Item 2");

    expect(septMonth).toBeInTheDocument();
    expect(octMonth).toBeInTheDocument();
    expect(septCalendarItem).toBeInTheDocument();
    expect(octCalendarItem).toBeInTheDocument();

    expect(septMonth).toPrecede(septCalendarItem);
    expect(septCalendarItem).toPrecede(octMonth);
    expect(octMonth).toPrecede(octCalendarItem);
  });

  it("shows completed calendar items as crossed off", () => {
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item 1",
      completed: true,
    });
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item 2",
      completed: false,
    });

    render(<App store={sessionStore} />);
    expect(screen.getByText("Test Calendar Item 1")).toHaveClass("completed");
    expect(screen.getByText("Test Calendar Item 2")).not.toHaveClass(
      "completed"
    );
  });

  it("allows adding any month if there are no existing months", async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("Board Calendar Items"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Add Month:"), "September");
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("September")).toBeInTheDocument();
  });

  it("allows adding the preceding month if there are existing months", async () => {
    expect.assertions(1);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarMonth("October", 1);
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("October"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Add August" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("August")).toBeInTheDocument();
  });

  it("allows adding the next month if there are existing months", async () => {
    expect.assertions(1);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarMonth("October", 1);
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("October"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Add November" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("November")).toBeInTheDocument();
  });

  it("allows removing a month", async () => {
    expect.assertions(1);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarMonth("October", 1);
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("October"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete September" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.queryByText("September")).not.toBeInTheDocument();
  });

  it("allows adding calendar items", async () => {
    expect.assertions(2);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarMonth("October", 1);
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("October"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const allItemInputs = screen.getAllByLabelText("New Item Text");
    expect(allItemInputs).toHaveLength(2);
    await user.type(allItemInputs[0], "Test Calendar Item");
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Test Calendar Item")).toBeInTheDocument();
  });

  it("allows removing calendar items from the end of the month's list", async () => {
    expect.assertions(3);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item 1",
      completed: false,
    });
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item 2",
      completed: false,
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("September"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const allItemDeleteButtons = screen.getAllByRole("button", {
      name: "Delete Item",
    });
    expect(allItemDeleteButtons).toHaveLength(2);
    fireEvent.click(allItemDeleteButtons[1]);
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.queryByText("Test Calendar Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Test Calendar Item 2")).not.toBeInTheDocument();
  });
  it("allows removing calendar items from the middle of the month's list", async () => {
    expect.assertions(3);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item 1",
      completed: false,
    });
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item 2",
      completed: false,
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("September"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const allItemDeleteButtons = screen.getAllByRole("button", {
      name: "Delete Item",
    });
    expect(allItemDeleteButtons).toHaveLength(2);
    fireEvent.click(allItemDeleteButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.queryByText("Test Calendar Item 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Calendar Item 2")).toBeInTheDocument();
  });

  it("allows editing the text of a calendar item", async () => {
    expect.assertions(1);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item",
      completed: false,
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("September"));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const input = screen.getByDisplayValue("Test Calendar Item");
    await user.clear(input);
    await user.type(input, "New Calendar Item Text");
    await user.keyboard("{enter}");
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("New Calendar Item Text")).toBeInTheDocument();
  });
  it("allows marking a calendar item as completed", async () => {
    expect.assertions(1);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item",
      completed: false,
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("September"));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await user.click(screen.getByLabelText("Completed"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Test Calendar Item")).toHaveClass("completed");
  });

  it("allows marking a calendar item as not completed", async () => {
    expect.assertions(1);
    sessionStore.addCalendarMonth("September", 0);
    sessionStore.addCalendarItem("September", {
      text: "Test Calendar Item",
      completed: true,
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    await user.hover(screen.getByText("September"));
    await fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await user.click(screen.getByLabelText("Completed"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));
    rerender(<App store={sessionStore} />);
    expect(screen.getByText("Test Calendar Item")).not.toHaveClass("completed");
  });

  it("allows collapsing the calendar", () => {
    sessionStore.addCalendarMonth("September", 0);
    render(<App store={sessionStore} />);

    expect(screen.getByText("Board Calendar Items")).toBeInTheDocument();
    expect(screen.getByText("September")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Collapse calendar" }));

    expect(screen.getByText("Board Calendar Items")).toBeInTheDocument();
    expect(screen.queryByText("September")).not.toBeInTheDocument();
  });

  it("allows expanding the calendar", () => {
    sessionStore.addCalendarMonth("September", 0);
    render(<App store={sessionStore} />);

    expect(screen.getByText("Board Calendar Items")).toBeInTheDocument();
    expect(screen.getByText("September")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Collapse calendar" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand calendar" }));

    expect(screen.getByText("Board Calendar Items")).toBeInTheDocument();
    expect(screen.getByText("September")).toBeInTheDocument();
  });
});

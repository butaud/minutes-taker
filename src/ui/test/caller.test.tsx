import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { getByTextContent } from "../../test/matchers";
import { App } from "../../App";

let sessionStore: SessionStore;

describe("caller", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

  it("shows the caller", () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.updateCaller({
      person: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      role: "Test Role",
    });
    render(<App store={sessionStore} />);
    expect(
      screen.getByText(
        getByTextContent("Mr. Jones, Test Role, called the meeting to order.")
      )
    ).toBeInTheDocument();
  });

  it("shows default text if there is no caller", () => {
    render(<App store={sessionStore} />);
    expect(
      screen.getByText("The meeting was called to order.")
    ).toBeInTheDocument();
  });

  it("allows editing the caller", async () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });

    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(screen.getByText("The meeting was called to order."));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Caller"), "Bob Jones");
    await user.type(screen.getByLabelText("Role"), "Test Role");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText(
        getByTextContent("Mr. Jones, Test Role, called the meeting to order.")
      )
    ).toBeInTheDocument();
  });

  it("allows removing the caller", async () => {
    sessionStore.addMemberPresent({
      title: "Mr.",
      firstName: "Bob",
      lastName: "Jones",
    });
    sessionStore.updateCaller({
      person: { title: "Mr.", firstName: "Bob", lastName: "Jones" },
      role: "Test Role",
    });
    expect.assertions(1);
    const user = userEvent.setup();
    render(<App store={sessionStore} />);

    await user.hover(
      screen.getByText(
        getByTextContent("Mr. Jones, Test Role, called the meeting to order.")
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Caller"), "");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("The meeting was called to order.")
    ).toBeInTheDocument();
  });
});

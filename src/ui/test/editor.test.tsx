import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import userEvent from "@testing-library/user-event";
import { render, resetSessionStore } from "./util";
import { getByTextContent } from "../../test/matchers";

let sessionStore: SessionStore;

describe("editor", () => {
  beforeEach(() => {
    sessionStore = resetSessionStore();
  });

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
      screen.getByLabelText("Name to add to Members in attendance"),
      "Bob Jones"
    );
    await user.keyboard("{enter}");
    await user.type(
      screen.getByLabelText("Name to add to Members in attendance"),
      "Tom Smith"
    );
    await user.keyboard("{enter}");

    fireEvent.click(screen.getByRole("button", { name: "Stop Editing" }));

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

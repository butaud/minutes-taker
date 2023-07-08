import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ActionItemNoteNode } from "./ActionItemNoteNode";
import {
  SessionStore,
  StoredActionItemNote,
} from "../../../store/SessionStore";
import * as SessionStoreContext from "../../context/SessionStoreContext";

const note: StoredActionItemNote = {
  id: 1,
  assignee: { id: 1, firstName: "Bob", lastName: "Smith" },
  text: "Do the thing",
  dueDate: new Date("2022-01-01"),
  type: "actionItem" as const,
};

describe("ActionItemNoteNode", () => {
  it("renders with assignee, text, and due date when not editing", () => {
    render(<ActionItemNoteNode note={note} />);
    expect(screen.getByText("Mr. Smith")).toBeInTheDocument();
    expect(
      screen.getByText("Do the thing", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("by 1/1/2022", { exact: false })
    ).toBeInTheDocument();
  });

  it("renders inputs for assignee, text, and due date when editing", async () => {
    render(<ActionItemNoteNode note={note} />);
    await userEvent.hover(screen.getByText("Mr. Smith"));
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Person selector")).toBeInTheDocument();
    expect(screen.getByLabelText("Action item text")).toBeInTheDocument();
    expect(screen.getByLabelText("Action item due date")).toBeInTheDocument();
  });

  it("drops changes when cancel is clicked", async () => {
    render(<ActionItemNoteNode note={note} />);
    await userEvent.hover(screen.getByText("Mr. Smith"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Action item text"), {
      target: { value: "Do the other thing" },
    });
    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.getByText("Do the thing", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("by 1/1/2022", { exact: false })
    ).toBeInTheDocument();
  });

  it("saves changes to the note when save is clicked", async () => {
    const mockSessionStore = {
      updateNote: vi.fn(),
    };

    vi.spyOn(SessionStoreContext, "useSessionStore").mockReturnValue(
      mockSessionStore as unknown as SessionStore
    );
    render(<ActionItemNoteNode note={note} />);
    await userEvent.hover(screen.getByText("Mr. Smith"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Action item text"), {
      target: { value: "Do the other thing" },
    });
    fireEvent.change(screen.getByLabelText("Action item due date"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(mockSessionStore.updateNote).toHaveBeenCalledWith({
      id: 1,
      assignee: note.assignee,
      type: "actionItem",
      text: "Do the other thing",
      dueDate: new Date("2020-01-01"),
    });
  });
});

import { initializeIdb, setIdb, getIdb, clearIdb } from "../../fs/idb.mock";
import { MockFileHandle, mockFilePicker } from "../../fs/file-manager.mock";
import { SessionStore } from "../../store/SessionStore";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import { render, resetSessionStore } from "./util";
import { vi } from "vitest";
import { resetSaveContext, unsetHandle } from "../../fs/io";

let sessionStore: SessionStore;

// Needed for these tests because the file picker is async and we need to wait for it to finish
export const allowPropagation = async () => {
  await act(async () => await new Promise((resolve) => setTimeout(resolve, 1)));
};

vi.mock("../../fs/idb.ts", () => ({
  initializeIdb,
  setIdb,
  getIdb,
}));

vi.mock("../../fs/local-file-manager.ts", () => ({
  localFilePicker: mockFilePicker,
}));

describe("follow-up session", () => {
  beforeEach(() => {
    mockFilePicker.reset();
    clearIdb();
    unsetHandle();
    resetSaveContext();
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

  describe("file behavior", () => {
    it("should create a new session with the same organization, title, subtitle, and location", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await allowPropagation();

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Test Organization"
      );

      expect(screen.getByRole("heading", { level: 2 }).textContent).toContain(
        `Test Meeting - Test Subtitle: Test Location`
      );
    });

    it("should save the previous session", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      const originalJson = JSON.stringify(sessionStore.export(), undefined, 2);

      await allowPropagation();

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      const savedHandle = new MockFileHandle("JSON", "test.json");
      mockFilePicker.resolveSave?.(savedHandle);

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);

      expect(savedHandle.getFileText()).toEqual(originalJson);
    });

    it("should reset the file handle", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      await allowPropagation();

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      const originalHandle = new MockFileHandle("JSON", "test.json");
      mockFilePicker.resolveSave?.(originalHandle);

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);

      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
            "test.json"
          );
        },
        { timeout: 1000 }
      );

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      fireEvent.change(screen.getByLabelText("Start time"), {
        target: { value: "2020-01-02 08:00:00" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);

      // expect it to be in unsaved state

      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
            "Unsaved"
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe("updated values", () => {
    it("should prompt for an updated date", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);

      fireEvent.change(screen.getByLabelText("Start time"), {
        target: { value: "2020-01-02 08:00:00" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await allowPropagation();
      rerender(<SessionEditor session={sessionStore.session} />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Test Meeting - Test Subtitle: Test Location, 1/2/20, 8:00 AM"
      );
    });
  });
  describe("topics", () => {
    it("should remove all notes from topics", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      sessionStore.addTopic({
        title: "Call to Order",
        startTime: new Date("2000-01-01T19:01:00Z"),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "text",
        text: "The meeting was called to order at 7:01pm.",
      });

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      await allowPropagation();

      const savedHandle = new MockFileHandle("JSON", "test.json");
      mockFilePicker.resolveSave?.(savedHandle);

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await allowPropagation();

      rerender(<SessionEditor session={sessionStore.session} />);

      expect(screen.getByText("Call to Order")).toBeInTheDocument();
      expect(
        screen.queryByText("The meeting was called to order at 7:01pm.")
      ).not.toBeInTheDocument();
    });
  });
});

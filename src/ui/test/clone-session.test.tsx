import { initializeIdb, setIdb, getIdb, clearIdb } from "../../fs/idb.mock";
import { MockFileHandle, mockFilePicker } from "../../fs/file-manager.mock";
import { SessionStore } from "../../store/SessionStore";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { resetSessionStore } from "./util";
import { vi } from "vitest";
import { unsetHandle } from "../../fs/io";
import { App } from "../../App";
import { __clearDialogs } from "../dialog/dialog";

let sessionStore: SessionStore;

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
    __clearDialogs();
    mockFilePicker.reset();
    clearIdb();
    unsetHandle();
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
      render(<App store={sessionStore} />);

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Test Organization"
      );

      expect(screen.getByRole("heading", { level: 2 }).textContent).toContain(
        `Test Meeting - Test Subtitle: Test Location`
      );
    });

    it("should save the previous session", async () => {
      render(<App store={sessionStore} />);
      const originalJson = JSON.stringify(sessionStore.export(), undefined, 2);

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      const savedHandle = new MockFileHandle("JSON", "test.json");
      await mockFilePicker.resolveSave(savedHandle);

      expect(savedHandle.getFileText()).toEqual(originalJson);
    });

    it("should reset the file handle", async () => {
      render(<App store={sessionStore} />);

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      const originalHandle = new MockFileHandle("JSON", "test.json");
      await mockFilePicker.resolveSave(originalHandle);

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

      await waitFor(
        () => {
          screen.getByText("Create follow-up session");
        },
        { timeout: 10 }
      );

      fireEvent.change(screen.getByLabelText("Start time"), {
        target: { value: "2020-01-02 08:00:00" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

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
      render(<App store={sessionStore} />);

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      await mockFilePicker.resolveSave(new MockFileHandle("JSON", "test.json"));

      act(() =>
        fireEvent.change(screen.getByLabelText("Start time"), {
          target: { value: "2020-01-02 08:00:00" },
        })
      );

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await waitFor(
        () =>
          expect(screen.getByRole("alert")).toHaveTextContent(
            "Created follow-up session."
          ),
        { timeout: 100 }
      );

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Test Meeting - Test Subtitle: Test Location, 1/2/20, 8:00 AM"
      );
    });
  });
  describe("topics", () => {
    it("should remove all notes from topics", async () => {
      render(<App store={sessionStore} />);

      act(() => {
        sessionStore.addTopic({
          title: "Call to Order",
          startTime: new Date("2000-01-01T19:01:00Z"),
        });
        sessionStore.addNote(sessionStore.session.topics[0].id, {
          type: "text",
          text: "The meeting was called to order at 7:01pm.",
        });
      });

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      const savedHandle = new MockFileHandle("JSON", "test.json");
      await mockFilePicker.resolveSave(savedHandle);

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await waitFor(
        () =>
          expect(screen.getByRole("alert")).toHaveTextContent(
            "Created follow-up session."
          ),
        { timeout: 100 }
      );

      expect(screen.getByText("Call to Order")).toBeInTheDocument();
      expect(
        screen.queryByText("The meeting was called to order at 7:01pm.")
      ).not.toBeInTheDocument();
    });

    it("should allow selecting which topics to keep", async () => {
      render(<App store={sessionStore} />);

      act(() => {
        sessionStore.addTopic({
          title: "Call to Order",
          startTime: new Date("2000-01-01T19:01:00Z"),
        });
        sessionStore.addTopic({
          title: "Approval of Minutes",
          startTime: new Date("2000-01-01T19:02:00Z"),
        });
      });

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Follow-up..." }));

      const savedHandle = new MockFileHandle("JSON", "test.json");
      await mockFilePicker.resolveSave(savedHandle);

      // uncheck the first topic
      fireEvent.click(screen.getByRole("checkbox", { name: "Call to Order" }));
      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await waitFor(
        () =>
          expect(screen.getByRole("alert")).toHaveTextContent(
            "Created follow-up session."
          ),
        { timeout: 100 }
      );

      expect(screen.queryByText("Call to Order")).not.toBeInTheDocument();

      expect(screen.queryByText("Approval of Minutes")).toBeInTheDocument();
    });
  });
});

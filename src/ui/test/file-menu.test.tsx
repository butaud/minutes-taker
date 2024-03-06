import { initializeIdb, setIdb, getIdb, clearIdb } from "../../fs/idb.mock";
import { MockFileHandle, MockFilePicker } from "../../fs/file-manager.mock";
import { SessionStore } from "../../store/SessionStore";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import { render, resetSessionStore } from "./util";
import { vi } from "vitest";
import { resetSaveContext } from "../../fs/io";
import test from "./data/test.json";

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
  LocalFilePicker: MockFilePicker,
}));

describe("editor", () => {
  beforeEach(() => {
    MockFilePicker.reset();
    clearIdb();
    resetSaveContext();
    sessionStore = resetSessionStore();
  });

  describe("menu title", () => {
    it("is unsaved before the file is saved", async () => {
      render(<SessionEditor session={sessionStore.session} />);

      await allowPropagation();

      expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
        "Unsaved"
      );
    });

    it("is the filename after the file is saved", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await allowPropagation();

      // set the mock filename that the file picker will return
      MockFilePicker.setMockFilename("test.json");

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      // rerender
      rerender(<SessionEditor session={sessionStore.session} />);
      // assert that the menu icon title is now "test.json"
      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
            "test.json"
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe("save button", () => {
    it("writes the file as JSON", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "link",
        text: "Test Link",
        url: "https://example.com",
      });
      render(<SessionEditor session={sessionStore.session} />);
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      expect(MockFilePicker.handles[0].getFileText()).toBe(
        JSON.stringify(sessionStore.export(), null, 2)
      );
    });

    it("reuses the file handle if the file has already been saved", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "link",
        text: "Test Link",
        url: "https://example.com",
      });
      render(<SessionEditor session={sessionStore.session} />);
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      sessionStore.addTopic({
        title: "Another Topic",
        startTime: new Date(),
      });

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      // make sure we didn't fetch another handle
      expect(MockFilePicker.handles.length).toBe(1);
    });

    it("writes the output so that it can be loaded again", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "link",
        text: "Test Link",
        url: "https://example.com",
      });
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      const savedHandle = MockFilePicker.handles[0];

      sessionStore.addTopic({
        title: "Another Topic",
        startTime: new Date(),
      });

      rerender(<SessionEditor session={sessionStore.session} />);

      // expect new topic to be in the session
      expect(screen.getByText("Another Topic")).toBeInTheDocument();

      // load the saved session
      MockFilePicker.openCallback = () => savedHandle;
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Load" }));

      await allowPropagation();

      rerender(<SessionEditor session={sessionStore.session} />);

      // expect the original topic to be there but the new topic to be gone
      expect(screen.getByText("Test Topic")).toBeInTheDocument();
      expect(screen.queryByText("Another Topic")).not.toBeInTheDocument();
    });
  });

  describe("save as button", () => {
    it("writes the file as JSON", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "link",
        text: "Test Link",
        url: "https://example.com",
      });
      render(<SessionEditor session={sessionStore.session} />);
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save as" }));

      await allowPropagation();

      expect(MockFilePicker.handles[0].getFileText()).toBe(
        JSON.stringify(sessionStore.export(), null, 2)
      );
    });

    it("does not reuse the file handle if the file has already been saved", async () => {
      sessionStore.addTopic({
        title: "Test Topic",
        startTime: new Date(),
      });
      sessionStore.addNote(sessionStore.session.topics[0].id, {
        type: "link",
        text: "Test Link",
        url: "https://example.com",
      });
      render(<SessionEditor session={sessionStore.session} />);
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      sessionStore.addTopic({
        title: "Another Topic",
        startTime: new Date(),
      });

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save as" }));

      await allowPropagation();

      expect(MockFilePicker.handles.length).toBe(2);
    });
  });

  describe("load button", () => {
    it("loads the file as JSON", async () => {
      const jsonToLoad = JSON.stringify(test, null, 2);
      const mockHandle = new MockFileHandle("JSON", "test.json");
      mockHandle.setFileText(jsonToLoad);

      MockFilePicker.openCallback = () => mockHandle;

      render(<SessionEditor session={sessionStore.session} />);
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Load" }));

      await allowPropagation();

      expect(sessionStore.session.metadata.title).toBe("Title from test.json");
    });

    it("sets the filename to the loaded file", async () => {
      const jsonToLoad = JSON.stringify(test, null, 2);
      const mockHandle = new MockFileHandle("JSON", "test.json");
      mockHandle.setFileText(jsonToLoad);

      MockFilePicker.openCallback = () => mockHandle;

      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Load" }));

      rerender(<SessionEditor session={sessionStore.session} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
          "test.json"
        );
      });
    });

    it("updates the current file handle if a file has already been loaded", async () => {
      const jsonToLoad = JSON.stringify(test, null, 2);
      const mockHandleToOpen = new MockFileHandle("JSON", "test.json");
      mockHandleToOpen.setFileText(jsonToLoad);

      MockFilePicker.openCallback = () => mockHandleToOpen;

      render(<SessionEditor session={sessionStore.session} />);
      await allowPropagation();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      const originalHandle = MockFilePicker.handles[0];
      const originalHandleContents = originalHandle.getFileText();

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Load" }));

      await allowPropagation();

      sessionStore.updateMetadata({
        ...sessionStore.session.metadata,
        title: "Modified Title",
      });

      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await allowPropagation();

      // make sure we wrote to the new handle, not the original one
      expect(originalHandle.getFileText()).toBe(originalHandleContents);
      expect(mockHandleToOpen.getFileText()).toContain("Modified Title");
    });
  });
});

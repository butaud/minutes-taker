import { initializeIdb, setIdb, getIdb, clearIdb } from "../../fs/idb.mock";
import { MockFileHandle, mockFilePicker } from "../../fs/file-manager.mock";
import { SessionStore } from "../../store/SessionStore";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { SessionEditor } from "../SessionEditor";
import { render, resetSessionStore } from "./util";
import { vi } from "vitest";
import { unsetHandle } from "../../fs/io";
import test from "./data/test.json";

let sessionStore: SessionStore;

vi.mock("../../fs/idb.ts", () => ({
  initializeIdb,
  setIdb,
  getIdb,
}));

vi.mock("../../fs/local-file-manager.ts", () => ({
  localFilePicker: mockFilePicker,
}));

describe("editor", () => {
  beforeEach(async () => {
    mockFilePicker.reset();
    clearIdb();
    await unsetHandle();
    sessionStore = resetSessionStore();
  });

  describe("menu title", () => {
    it("is unsaved before the file is saved", async () => {
      render(<SessionEditor session={sessionStore.session} />);

      expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
        "Unsaved"
      );
    });

    it("is the filename after the file is saved", async () => {
      const { rerender } = render(
        <SessionEditor session={sessionStore.session} />
      );

      // click menu button
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await mockFilePicker.resolveSave(new MockFileHandle("JSON", "test.json"));

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
});
describe("save button", () => {
  beforeEach(() => {
    mockFilePicker.reset();
    clearIdb();
    unsetHandle();
    sessionStore = resetSessionStore();
  });

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

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const savedHandle = new MockFileHandle("JSON", "test.json");
    await mockFilePicker.resolveSave(savedHandle);

    expect(savedHandle.getFileText()).toBe(
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

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const firstHandle = new MockFileHandle("JSON", "test.json");
    await mockFilePicker.resolveSave(firstHandle);

    sessionStore.addTopic({
      title: "Another Topic",
      startTime: new Date(),
    });

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const secondHandle = new MockFileHandle("JSON", "test2.json");
    await mockFilePicker.resolveSave(secondHandle);

    // make sure we didn't write to the second handle
    expect(secondHandle.getFileText()).toEqual("");
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

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const savedHandle = new MockFileHandle("JSON", "test.json");
    await mockFilePicker.resolveSave(savedHandle);

    sessionStore.addTopic({
      title: "Another Topic",
      startTime: new Date(),
    });

    rerender(<SessionEditor session={sessionStore.session} />);

    // expect new topic to be in the session
    expect(screen.getByText("Another Topic")).toBeInTheDocument();

    // load the saved session
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Load" }));

    await mockFilePicker.resolveOpen(savedHandle);

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

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save as" }));

    const savedHandle = new MockFileHandle("JSON", "test.json");
    await mockFilePicker.resolveSave(savedHandle);

    expect(savedHandle.getFileText()).toBe(
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

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const firstHandle = new MockFileHandle("JSON", "test.json");
    await mockFilePicker.resolveSave(firstHandle);

    sessionStore.addTopic({
      title: "Another Topic",
      startTime: new Date(),
    });

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save as" }));

    const secondHandle = new MockFileHandle("JSON", "test2.json");
    await mockFilePicker.resolveSave(secondHandle);

    expect(firstHandle.getFileText()).not.toContain("Another Topic");
    expect(secondHandle.getFileText()).toContain("Another Topic");
  });
});

describe("load button", () => {
  it("loads the file as JSON", async () => {
    const jsonToLoad = JSON.stringify(test, null, 2);
    const mockHandle = new MockFileHandle("JSON", "test.json");
    mockHandle.setFileText(jsonToLoad);

    render(<SessionEditor session={sessionStore.session} />);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Load" }));

    await mockFilePicker.resolveOpen(mockHandle);

    expect(sessionStore.session.metadata.title).toBe("Title from test.json");
  });

  it("sets the filename to the loaded file", async () => {
    const jsonToLoad = JSON.stringify(test, null, 2);
    const mockHandle = new MockFileHandle("JSON", "test.json");
    mockHandle.setFileText(jsonToLoad);

    const { rerender } = render(
      <SessionEditor session={sessionStore.session} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Load" }));

    await mockFilePicker.resolveOpen(mockHandle);

    rerender(<SessionEditor session={sessionStore.session} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Menu" }).title).toBe(
        "test.json"
      );
    });
  });

  it("updates the current file handle if a file has already been loaded", async () => {
    render(<SessionEditor session={sessionStore.session} />);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const originalHandle = new MockFileHandle("JSON", "test.json");
    await mockFilePicker.resolveSave(originalHandle);

    const originalHandleContents = originalHandle.getFileText();

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Load" }));

    const jsonToLoad = JSON.stringify(test, null, 2);
    const secondHandle = new MockFileHandle("JSON", "test.json");
    secondHandle.setFileText(jsonToLoad);

    await mockFilePicker.resolveOpen(secondHandle);

    sessionStore.updateMetadata({
      ...sessionStore.session.metadata,
      title: "Modified Title",
    });

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(
      () => {
        // make sure we wrote to the new handle, not the original one
        expect(originalHandle.getFileText()).toBe(originalHandleContents);
        expect(secondHandle.getFileText()).toContain("Modified Title");
      },
      // allow for the async save to finish
      { timeout: 10 }
    );
  });
});

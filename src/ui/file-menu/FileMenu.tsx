import { FC, useCallback, useEffect, useState } from "react";
import "./FileMenu.css";
import { useSessionStore } from "../context/SessionStoreContext";
import { useInserting } from "../context/InsertingContext";
import { useAsyncReporter } from "../async-reporter-hook";
import {
  loadSession,
  saveSession,
  saveSessionAsDocx,
  unsetHandle,
  useContextFilename,
} from "../../fs/io";
import { fakeSession } from "../fake-session";
import { getDialogResult } from "../dialog/dialog";
import {
  CloneDialog,
  CloneDialogProps,
  CloneDialogResult,
} from "../dialog/CloneDialog";
import { CancelledError } from "../dialog/dialog.interface";

export type FileMenuProps = {
  setInserting: (inserting: boolean) => void;
};

export const FileMenu: FC<FileMenuProps> = ({ setInserting }) => {
  const [expanded, setExpanded] = useState(false);
  const sessionStore = useSessionStore();
  const inserting = useInserting();
  const { report, tryAsyncOperation } = useAsyncReporter();
  const contextFilename = useContextFilename();

  const undo = useCallback(() => sessionStore.undo(), [sessionStore]);
  const redo = useCallback(() => sessionStore.redo(), [sessionStore]);
  const toggleInsert = useCallback(
    () => setInserting(!inserting),
    [inserting, setInserting]
  );
  const sortTopics = useCallback(
    () => sessionStore.sortTopics(),
    [sessionStore]
  );
  const save = useCallback(
    () =>
      tryAsyncOperation({
        perform: () => saveSession(sessionStore.export(), true),
        successMessage: "Session saved to JSON.",
        failureMessage: "Error saving session to JSON.",
      }),
    [sessionStore, tryAsyncOperation]
  );
  const saveAs = useCallback(() => {
    tryAsyncOperation({
      perform: () => saveSession(sessionStore.export(), false),
      successMessage: "Session saved to JSON.",
      failureMessage: "Error saving session to JSON.",
    });
  }, [tryAsyncOperation, sessionStore]);
  const load = useCallback(
    () =>
      tryAsyncOperation({
        perform: async () => {
          const session = await loadSession();
          sessionStore.loadSession(session);
        },
        successMessage: "Loaded session from JSON.",
        failureMessage: "Error loading session.",
      }),
    [sessionStore, tryAsyncOperation]
  );
  const exportDocx = useCallback(
    () =>
      tryAsyncOperation({
        perform: () => saveSessionAsDocx(sessionStore.export()),
        successMessage: "Session exported as docx.",
        failureMessage: "Error saving as docx.",
      }),
    [sessionStore, tryAsyncOperation]
  );
  const createFollowUpSession = useCallback(
    () =>
      tryAsyncOperation({
        perform: async () => {
          await saveSession(sessionStore.export(), true);
          try {
            const result = await getDialogResult<
              CloneDialogProps,
              CloneDialogResult
            >(CloneDialog, {
              topics: sessionStore.session.topics,
            });
            sessionStore.cloneSession({
              startTime: result.startTime,
              removeNotes: true,
              selectedTopicIds: result.selectedTopicIds,
            });

            await unsetHandle();
          } catch (e) {
            if (!(e instanceof CancelledError)) {
              throw e;
            }
          }
        },
        successMessage: "Created follow-up session.",
        failureMessage: "Error creating follow-up session.",
      }),
    [tryAsyncOperation, sessionStore]
  );
  const loadFake = useCallback(
    () => sessionStore.loadSession(fakeSession),
    [sessionStore]
  );

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        // don't handle keyboard shortcuts when typing in an input
        return;
      }
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      } else if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        toggleInsert();
      } else if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        save();
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        open();
      } else if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        exportDocx();
      }
    },
    [exportDocx, redo, save, toggleInsert, undo]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const fileButtons = [
    { label: "Save", action: save },
    { label: "Save as", action: saveAs },
    { label: "Load", action: load },
    { label: "Export", action: exportDocx },
    { label: "Follow-up...", action: createFollowUpSession },
    { label: "Load Fake Data", action: loadFake },
  ];
  const editButtons = [
    { label: inserting ? "Stop Inserting" : "Insert", action: toggleInsert },
    { label: "Undo", action: undo },
    { label: "Redo", action: redo },
    { label: "Sort Topics", action: sortTopics },
  ];

  const closeMenu = () => {
    setExpanded(false);
  };

  return (
    <>
      {report && (
        <p className={"message " + report.type} role="alert">
          {report.message}
        </p>
      )}
      <div className={"menu " + (expanded ? "expanded" : "")}>
        <i
          role="button"
          aria-label="Menu"
          className={`material-icons  ${contextFilename ? "saved" : "unsaved"}`}
          onClick={() => setExpanded(!expanded)}
          title={contextFilename ?? "Unsaved"}
        >
          menu
        </i>
        {expanded && (
          <>
            <ul>
              {fileButtons.map((button) => (
                <MenuButton
                  key={button.label}
                  action={button.action}
                  label={button.label}
                  closeMenu={closeMenu}
                />
              ))}
              <hr />
              {editButtons.map((button) => (
                <MenuButton
                  key={button.label}
                  action={button.action}
                  label={button.label}
                  closeMenu={closeMenu}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
};

type MenuButtonProps = {
  action: () => void;
  label: string;
  closeMenu: () => void;
};

export const MenuButton: FC<MenuButtonProps> = ({
  action,
  label,
  closeMenu,
}) => {
  return (
    <li>
      <button
        onClick={() => {
          action();
          closeMenu();
        }}
      >
        {label}
      </button>
    </li>
  );
};

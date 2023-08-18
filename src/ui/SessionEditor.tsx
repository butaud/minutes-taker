import React, { Fragment, useEffect } from "react";
import { NewTopicNode, TopicNode } from "./nodes/topic/TopicNode";
import { AttendanceNode } from "./nodes/attendance/AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/types";
import { useSessionStore } from "./context/SessionStoreContext";
import { SessionHeaderNode } from "./nodes/header/SessionHeaderNode";
import { InsertingContext } from "./context/InsertingContext";
import {
  initializeIndexedDbBackup,
  loadSession,
  saveSession,
  saveSessionAsDocx,
} from "../fs/io";
import { CallerNode } from "./nodes/caller/CallerNode";
import { useAsyncReporter } from "./async-reporter-hook";
import { CalendarNode } from "./nodes/calendar/CalendarNode";
import { CommitteeSection } from "./nodes/committee/CommitteeSection";
import { ActionItemsSection } from "./nodes/listed-action-items/ActionItemsSection";
import { fakeSession } from "./fake-session";
import { FileMenu } from "./file-menu/FileMenu";

export const SessionEditor: React.FC<{ session: StoredSession }> = ({
  session,
}) => {
  const sessionStore = useSessionStore();

  const [isInserting, setIsInserting] = React.useState(false);
  const { report, tryAsyncOperation } = useAsyncReporter();

  const undo = () => sessionStore.undo();
  const redo = () => sessionStore.redo();
  const insert = () => setIsInserting((isInserting) => !isInserting);
  const save = () =>
    tryAsyncOperation({
      perform: () => saveSession(sessionStore.export(), true),
      successMessage: "Session saved to JSON.",
      failureMessage: "Error saving session to JSON.",
    });
  const saveAs = () => {
    tryAsyncOperation({
      perform: () => saveSession(sessionStore.export(), false),
      successMessage: "Session saved to JSON.",
      failureMessage: "Error saving session to JSON.",
    });
  };
  const load = () =>
    tryAsyncOperation({
      perform: async () => {
        const session = await loadSession();
        sessionStore.loadSession(session);
      },
      successMessage: "Loaded session from JSON.",
      failureMessage: "Error loading session.",
    });
  const exportDocx = () =>
    tryAsyncOperation({
      perform: () => saveSessionAsDocx(sessionStore.export()),
      successMessage: "Session exported as docx.",
      failureMessage: "Error saving as docx.",
    });
  const loadFake = () => sessionStore.loadSession(fakeSession);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      } else if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        insert();
      } else if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        save();
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        open();
      } else if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        exportDocx();
      } else if (event.ctrlKey && event.shiftKey && event.key === "F") {
        event.preventDefault();
        loadFake();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sessionStore]);

  useEffect(() => {
    initializeIndexedDbBackup();
  }, []);

  return (
    <InsertingContext.Provider value={isInserting}>
      {report && (
        <p className={"message " + report.type} role="alert">
          {report.message}
        </p>
      )}
      <div>
        <FileMenu
          onExport={exportDocx}
          onLoad={load}
          onSave={save}
          onSaveAs={saveAs}
          onInsert={insert}
          onLoadFakeData={loadFake}
          onRedo={redo}
          onUndo={undo}
        />
        <SessionHeaderNode metadata={session.metadata} />
        <AttendanceNode
          present={session.metadata.membersPresent}
          absent={session.metadata.membersAbsent}
          administrationPresent={session.metadata.administrationPresent}
        />
        <CalendarNode calendar={session.calendar} />
        <CallerNode caller={session.metadata.caller} />
        <ul>
          {session.topics.map((topic, index) => (
            <Fragment key={topic.id}>
              {isInserting && <NewTopicNode miniature beforeIndex={index} />}
              <TopicNode topic={topic} />
            </Fragment>
          ))}
          <NewTopicNode miniature={false} />
        </ul>
        <CommitteeSection
          committees={session.committees}
          committeeDocUrl={session.metadata.committeeDocUrl}
        />
        <ActionItemsSection
          pastActionItems={session.pastActionItems}
          topics={session.topics}
        />
      </div>
    </InsertingContext.Provider>
  );
};

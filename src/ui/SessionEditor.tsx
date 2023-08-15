import React, { Fragment, useEffect } from "react";
import { NewTopicNode, TopicNode } from "./nodes/topic/TopicNode";
import { AttendanceNode } from "./nodes/attendance/AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";
import { SessionHeaderNode } from "./nodes/header/SessionHeaderNode";
import { InsertingContext } from "./context/InsertingContext";
import { loadSession, saveSession, saveSessionAsDocx } from "../fs/io";
import { CallerNode } from "./nodes/caller/CallerNode";
import { useAsyncReporter } from "./async-reporter-hook";
import { CalendarNode } from "./nodes/calendar/CalendarNode";
import { CommitteeSection } from "./nodes/committee/CommitteeSection";
import { ActionItemsSection } from "./nodes/listed-action-items/ActionItemsSection";

export const SessionEditor: React.FC<{ session: StoredSession }> = ({
  session,
}) => {
  const sessionStore = useSessionStore();

  const [isInserting, setIsInserting] = React.useState(false);
  const { report, tryAsyncOperation } = useAsyncReporter();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        sessionStore.undo();
      } else if (event.ctrlKey && event.key === "y") {
        sessionStore.redo();
      } else if (event.ctrlKey && event.key === "i") {
        setIsInserting((isInserting) => !isInserting);
      } else if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        tryAsyncOperation({
          perform: () => saveSession(sessionStore.export()),
          successMessage: "Session saved to JSON.",
          failureMessage: "Error saving session to JSON.",
        });
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        tryAsyncOperation({
          perform: async () => {
            const session = await loadSession();
            sessionStore.loadSession(session);
          },
          successMessage: "Loaded session from JSON.",
          failureMessage: "Error loading session.",
        });
      } else if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        tryAsyncOperation({
          perform: () => saveSessionAsDocx(sessionStore.export()),
          successMessage: "Session exported as docx.",
          failureMessage: "Error saving as docx.",
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sessionStore]);

  return (
    <InsertingContext.Provider value={isInserting}>
      {report && (
        <p className={"message " + report.type} role="alert">
          {report.message}
        </p>
      )}
      <div>
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

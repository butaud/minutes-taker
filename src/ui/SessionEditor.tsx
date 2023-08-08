import React, { useEffect } from "react";
import { NewTopicNode, TopicNode } from "./nodes/topic/TopicNode";
import { AttendanceNode } from "./nodes/attendance/AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";
import { SessionHeaderNode } from "./nodes/header/SessionHeaderNode";
import { InsertingContext } from "./context/InsertingContext";
import { loadSession, saveSession, saveSessionAsDocx } from "../fs/io";
import { CallerNode } from "./nodes/caller/CallerNode";

export const SessionEditor: React.FC<{ session: StoredSession }> = ({
  session,
}) => {
  const sessionStore = useSessionStore();

  const [isInserting, setIsInserting] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        sessionStore.undo();
      } else if (event.ctrlKey && event.key === "y") {
        sessionStore.redo();
      } else if (event.ctrlKey && event.key === "i") {
        setIsInserting((isInserting) => !isInserting);
      } else if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        const session = sessionStore.export();
        saveSession(session);
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        loadSession().then((session) => {
          sessionStore.loadSession(session);
        });
      } else if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        const session = sessionStore.export();
        saveSessionAsDocx(session);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sessionStore]);

  return (
    <InsertingContext.Provider value={isInserting}>
      <div>
        <SessionHeaderNode metadata={session.metadata} />
        <AttendanceNode
          present={session.metadata.membersPresent}
          absent={session.metadata.membersAbsent}
          administrationPresent={session.metadata.administrationPresent}
        />
        <CallerNode caller={session.metadata.caller} />
        <ul>
          {session.topics.map((topic, index) => (
            <>
              {isInserting && (
                <NewTopicNode
                  key={`newTopic-${index}`}
                  miniature
                  beforeIndex={index}
                />
              )}
              <TopicNode key={topic.id} topic={topic} />
            </>
          ))}
          <NewTopicNode miniature={false} />
        </ul>
      </div>
    </InsertingContext.Provider>
  );
};

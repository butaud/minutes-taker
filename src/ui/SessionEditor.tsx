import React, { useEffect } from "react";
import { TopicNode } from "./TopicNode";
import { AttendanceNode } from "./AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";

export const SessionEditor: React.FC<{ session: StoredSession }> = ({
  session,
}) => {
  const sessionStore = useSessionStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        sessionStore.undo();
      } else if (event.ctrlKey && event.key === "y") {
        sessionStore.redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sessionStore]);

  return (
    <div>
      <h1>Meeting on {session.metadata.startTime.toLocaleString()}</h1>
      <AttendanceNode
        present={session.metadata.membersPresent}
        absent={session.metadata.membersAbsent}
        administrationPresent={session.metadata.administrationPresent}
      />
      <ul>
        {session.topics.map((topic) => (
          <TopicNode topic={topic} />
        ))}
      </ul>
    </div>
  );
};

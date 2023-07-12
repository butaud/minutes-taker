import React, { useEffect } from "react";
import { NewTopicNode, TopicNode } from "./nodes/topic/TopicNode";
import { AttendanceNode } from "./nodes/attendance/AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";
import { SessionHeaderNode } from "./nodes/header/SessionHeaderNode";

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
      <SessionHeaderNode metadata={session.metadata} />
      <AttendanceNode
        present={session.metadata.membersPresent}
        absent={session.metadata.membersAbsent}
        administrationPresent={session.metadata.administrationPresent}
      />
      <ul>
        {session.topics.map((topic) => (
          <TopicNode key={topic.id} topic={topic} />
        ))}
        <NewTopicNode />
      </ul>
    </div>
  );
};

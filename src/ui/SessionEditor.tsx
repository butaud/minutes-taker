import React from "react";
import { TopicNode } from "./TopicNode";
import { AttendanceNode } from "./AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/SessionStore";
import { useSessionStore } from "../store/SessionStoreContext";

export const SessionEditor: React.FC<{ session: StoredSession }> = ({
  session,
}) => {
  const sessionStore = useSessionStore();

  const handleUndo = () => {
    sessionStore.undo();
  };

  const handleRedo = () => {
    sessionStore.redo();
  };

  return (
    <div>
      <h1>Meeting on {session.metadata.startTime.toLocaleString()}</h1>
      <div>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
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

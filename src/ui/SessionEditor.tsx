import React from "react";
import { TopicNode } from "./TopicNode";
import { AttendanceNode } from "./AttendanceNode";
import "./SessionEditor.css";
import { Immutable } from "immer";
import { Session } from "minute-model";

export const SessionEditor: React.FC<{ session: Immutable<Session> }> = ({
  session,
}) => {
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

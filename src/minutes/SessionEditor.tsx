import { Session } from "minute-model";
import React from "react";
import { TopicNode } from "./TopicNode";
import "./SessionEditor.css";

export const SessionEditor: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <div>
      <h1>Meeting on {session.metadata.startTime.toLocaleString()}</h1>
      <ul>
        {session.topics.map((topic) => (
          <TopicNode topic={topic} />
        ))}
      </ul>
    </div>
  );
};

import React, { useEffect } from "react";
import { NewTopicNode, TopicNode } from "./nodes/topic/TopicNode";
import { AttendanceNode } from "./nodes/attendance/AttendanceNode";
import "./SessionEditor.css";
import { StoredSession } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";
import { SessionHeaderNode } from "./nodes/header/SessionHeaderNode";
import { InsertingContext } from "./context/InsertingContext";

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
        const json = JSON.stringify(sessionStore.export());
        (async () => {
          const filename = `${session.metadata.organization}-${
            session.metadata.title
          }-${session.metadata.startTime.toDateString()}.json`;

          const handle = await window.showSaveFilePicker({
            types: [
              {
                description: "JSON File",
                accept: {
                  "application/json": [".json"],
                },
              },
            ],
            suggestedName: filename,
          });

          const writable = await handle.createWritable();
          await writable.write(json);
          await writable.close();
        })();
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        (async () => {
          const handle = await window.showOpenFilePicker({
            types: [
              {
                description: "JSON File",
                accept: {
                  "application/json": [".json"],
                },
              },
            ],
          });

          const file = await handle[0].getFile();
          const json = await file.text();
          const dateTimeReviver = (_: string, value: string) => {
            if (typeof value === "string") {
              const match =
                /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/.exec(
                  value
                );
              if (match) {
                return new Date(match[0]);
              }
            }
            return value;
          };
          sessionStore.loadSession(JSON.parse(json, dateTimeReviver));
        })();
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

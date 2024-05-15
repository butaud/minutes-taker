import { useState } from "react";
import { CancelledError, Dialog } from "./dialog.interface";

import "./CloneDialog.css";
import { StoredTopic } from "../../store/types";

export type CloneDialogProps = {
  topics: readonly StoredTopic[];
};

export type CloneDialogResult = {
  startTime: Date;
  selectedTopicIds: Set<number>;
};
export const CloneDialog: Dialog<CloneDialogProps, CloneDialogResult> = ({
  topics,
  complete,
  reject,
}) => {
  const [startTime, setStartTime] = useState(new Date());
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<number>>(
    new Set(topics.map((topic) => topic.id))
  );

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const timestamp = Date.parse(event.target.value + "Z");
    if (!isNaN(timestamp)) {
      const startTime = new Date(timestamp);
      setStartTime(startTime);
    }
  };

  return (
    <div className="clone-dialog">
      <h2>Create follow-up session</h2>
      <a className="cancel" onClick={() => reject(new CancelledError())}>
        X
      </a>
      <div className="content">
        <div className="form-line">
          <p>Start time:</p>
          <input
            type="datetime-local"
            aria-label="Start time"
            value={startTime.toISOString().slice(0, -8) ?? ""}
            onChange={handleStartTimeChange}
          />
        </div>
        <p>Topics to carry over:</p>
        {topics.map((topic) => (
          <div className="form-line" key={topic.id}>
            <label>
              {topic.title}
              <input
                type="checkbox"
                value={topic.id}
                checked={selectedTopicIds.has(topic.id)}
                onChange={(event) => {
                  const selected = new Set(selectedTopicIds);
                  if (event.target.checked) {
                    selected.add(topic.id);
                  } else {
                    selected.delete(topic.id);
                  }
                  setSelectedTopicIds(selected);
                }}
              />
            </label>
          </div>
        ))}
        <button onClick={() => complete({ startTime, selectedTopicIds })}>
          Create
        </button>
      </div>
    </div>
  );
};

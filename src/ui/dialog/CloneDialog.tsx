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
        <TopicTable
          topics={topics}
          topicIdsToInclude={selectedTopicIds}
          onToggleIncludeTopic={(topicId) => {
            const newSelectedTopicIds = new Set(selectedTopicIds);
            if (newSelectedTopicIds.has(topicId)) {
              newSelectedTopicIds.delete(topicId);
            } else {
              newSelectedTopicIds.add(topicId);
            }
            setSelectedTopicIds(newSelectedTopicIds);
          }}
        />
        <button onClick={() => complete({ startTime, selectedTopicIds })}>
          Create
        </button>
      </div>
    </div>
  );
};

type TopicTableProps = {
  topics: readonly StoredTopic[];
  topicIdsToInclude: Set<number>;
  onToggleIncludeTopic: (topicId: number) => void;
};

const TopicTable: React.FC<TopicTableProps> = ({
  topics,
  topicIdsToInclude,
  onToggleIncludeTopic,
}) => {
  return (
    <table className="topics">
      <thead>
        <tr>
          <th>Topic</th>
          <th className="checkbox">Include</th>
        </tr>
      </thead>
      <tbody>
        {topics.map((topic) => (
          <tr key={topic.id}>
            <td title={topic.title}>{topic.title}</td>
            <td className="checkbox">
              <input
                type="checkbox"
                aria-label={`Keep ${topic.title}`}
                checked={topicIdsToInclude.has(topic.id)}
                onChange={() => onToggleIncludeTopic(topic.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

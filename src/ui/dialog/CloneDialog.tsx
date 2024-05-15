import { useState } from "react";
import { CancelledError, Dialog } from "./dialog.interface";

import "./CloneDialog.css";
import { StoredTopic } from "../../store/types";

export type CloneDialogProps = {
  topics: readonly StoredTopic[];
};

export type CloneDialogResult = {
  startTime: Date;
  removeCompletedPastActionItems: boolean;
  selectedTopicIds: Set<number>;
  preserveNoteTopicIds: Set<number>;
};
export const CloneDialog: Dialog<CloneDialogProps, CloneDialogResult> = ({
  topics,
  complete,
  reject,
}) => {
  const [startTime, setStartTime] = useState(new Date());
  const [removeCompletedPastActionItems, setRemoveCompletedPastActionItems] =
    useState(true);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<number>>(
    new Set(topics.map((topic) => topic.id))
  );

  const [preserveNoteTopicIds, setPreserveNoteTopicIds] = useState<Set<number>>(
    new Set<number>()
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

  const onToggleIncludeTopic = (topicId: number) => {
    const newSelectedTopicIds = new Set(selectedTopicIds);
    if (newSelectedTopicIds.has(topicId)) {
      newSelectedTopicIds.delete(topicId);
    } else {
      newSelectedTopicIds.add(topicId);
    }
    setSelectedTopicIds(newSelectedTopicIds);
  };

  const onTogglePreserveNotes = (topicId: number) => {
    const newPreserveNoteTopicIds = new Set(preserveNoteTopicIds);
    if (newPreserveNoteTopicIds.has(topicId)) {
      newPreserveNoteTopicIds.delete(topicId);
    } else {
      newPreserveNoteTopicIds.add(topicId);
    }
    setPreserveNoteTopicIds(newPreserveNoteTopicIds);
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
        <div className="form-line">
          <p>Include completed past action items:</p>
          <input
            type="checkbox"
            aria-label="Include completed past action items"
            checked={!removeCompletedPastActionItems}
            onChange={() =>
              setRemoveCompletedPastActionItems(!removeCompletedPastActionItems)
            }
          />
        </div>
        <p>Topics to carry over:</p>
        <TopicTable
          topics={topics}
          topicIdsToInclude={selectedTopicIds}
          preserveNoteTopicIds={preserveNoteTopicIds}
          onToggleIncludeTopic={onToggleIncludeTopic}
          onTogglePreserveNotes={onTogglePreserveNotes}
        />
        <button
          onClick={() =>
            complete({
              startTime,
              removeCompletedPastActionItems,
              selectedTopicIds,
              preserveNoteTopicIds,
            })
          }
        >
          Create
        </button>
      </div>
    </div>
  );
};

type TopicTableProps = {
  topics: readonly StoredTopic[];
  topicIdsToInclude: Set<number>;
  preserveNoteTopicIds: Set<number>;
  onToggleIncludeTopic: (topicId: number) => void;
  onTogglePreserveNotes: (topicId: number) => void;
};

const TopicTable: React.FC<TopicTableProps> = ({
  topics,
  topicIdsToInclude,
  preserveNoteTopicIds,
  onToggleIncludeTopic,
  onTogglePreserveNotes,
}) => {
  return (
    <table className="topics">
      <thead>
        <tr>
          <th>Topic</th>
          <th className="checkbox">Include Topic</th>
          <th className="checkbox">Include Notes</th>
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
            <td className="checkbox">
              <input
                type="checkbox"
                aria-label={`Include notes for ${topic.title}`}
                checked={preserveNoteTopicIds.has(topic.id)}
                onChange={() => onTogglePreserveNotes(topic.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

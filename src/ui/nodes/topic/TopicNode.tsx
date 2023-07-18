import "./TopicNode.css";
import { SpeakerReference } from "../../controls/SpeakerReference";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { useCallback, useState } from "react";
import { useSessionStore } from "../../context/SessionStoreContext";
import { StoredPerson, StoredTopic } from "../../../store/SessionStore";
import { OptionalPersonSelector } from "../../controls/PersonSelector";
import { NoteNode } from "../NoteNode";
import { NewNoteNode } from "../NewNoteNode";

export const NewTopicNode: React.FC<{
  alwaysExpanded: boolean;
  beforeIndex?: number;
}> = ({ alwaysExpanded, beforeIndex }) => {
  const [isEditing, setIsEditing] = useState(false);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const onEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  if (isEditing) {
    return <TopicEditor stopEditing={stopEditing} beforeIndex={beforeIndex} />;
  } else if (alwaysExpanded) {
    return (
      <li>
        <button className="newTopic" onClick={onEdit} aria-label="Add Topic">
          <i className="material-icons">add</i>Add Topic
        </button>
      </li>
    );
  } else {
    return (
      <li className="newTopicPlaceholderContainer">
        <button
          className="newTopicPlaceholder expandClose"
          onClick={onEdit}
          aria-label="Add Topic Inline"
        >
          +
        </button>
      </li>
    );
  }
};

export const TopicNode: React.FC<{ topic: StoredTopic }> = ({ topic }) => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);

  const onDelete = useCallback(() => {
    sessionStore.removeTopic(topic);
  }, [topic]);
  return (
    <li>
      {isEditing ? (
        <TopicEditor
          existingTopic={topic}
          stopEditing={() => setIsEditing(false)}
        />
      ) : (
        <>
          <NodeControls onEdit={() => setIsEditing(true)} onDelete={onDelete}>
            <h3>{topic.title}</h3>
            <p className="topicTime">
              {topic.startTime.toLocaleTimeString("en-US", {
                timeStyle: "short",
              })}{" "}
              {topic.durationMinutes !== undefined
                ? `for ${topic.durationMinutes} minutes`
                : null}
            </p>
            {topic.leader && (
              <p>
                Lead by <SpeakerReference speaker={topic.leader} emphasis />
              </p>
            )}
          </NodeControls>
          <ul>
            {topic.notes.map((note, index) => (
              <>
                <NewNoteNode
                  topicId={topic.id}
                  alwaysExpanded={false}
                  key={`newNote-${topic.id}-${index}`}
                  beforeIndex={index}
                />
                <NoteNode key={note.id} note={note} />
              </>
            ))}
            <NewNoteNode
              key={`newNote-${topic.id}-end`}
              topicId={topic.id}
              alwaysExpanded
            />
          </ul>
        </>
      )}
    </li>
  );
};

type TopicEditorProps = {
  existingTopic?: StoredTopic;
  beforeIndex?: number;
  stopEditing: () => void;
};

type TopicDraft = {
  title?: string;
  startTime: Date;
  durationMinutes?: number;
  leader?: StoredPerson;
};

export const TopicEditor: React.FC<TopicEditorProps> = ({
  existingTopic,
  beforeIndex,
  stopEditing,
}) => {
  const [topicDraft, setTopicDraft] = useState<TopicDraft>(
    existingTopic ?? { startTime: new Date() }
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const sessionStore = useSessionStore();

  const handleTitleChange = (newTitle: string) => {
    setTopicDraft({ ...topicDraft, title: newTitle });
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = new Date(topicDraft.startTime ?? new Date());
    const [hours, minutes] = event.target.value.split(":");
    newDate.setHours(parseInt(hours));
    newDate.setMinutes(parseInt(minutes));
    setTopicDraft({ ...topicDraft, startTime: newDate });
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const durationString = event.target.value;
    const duration = durationString ? parseInt(durationString) : undefined;
    setTopicDraft({ ...topicDraft, durationMinutes: duration });
  };

  const handleLeaderChange = (newLeader: StoredPerson | undefined) => {
    setTopicDraft({ ...topicDraft, leader: newLeader });
  };

  const onSubmit = () => {
    if (!topicDraft.title) {
      setErrorMessage("Title cannot be empty.");
      return;
    } else {
      setErrorMessage(undefined);
    }
    const topicToSave = topicDraft as Pick<
      StoredTopic,
      "title" | "leader" | "startTime" | "durationMinutes"
    >;
    if (existingTopic) {
      sessionStore.updateTopic({
        ...topicToSave,
        id: existingTopic.id,
      });
    } else {
      sessionStore.addTopic(topicToSave, beforeIndex);
    }
    stopEditing();
  };

  const onCancel = () => {
    setTopicDraft(existingTopic ?? { startTime: new Date() });
    stopEditing();
  };

  return (
    <FormNodeControls onCancel={onCancel} onSubmit={onSubmit} className="topic">
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <div>
        <label htmlFor="topic-title">Title</label>
        <input
          id="topic-title"
          type="text"
          value={topicDraft.title ?? ""}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="topic-start-time">Start Time</label>
        <input
          id="topic-start-time"
          type="time"
          step={60}
          value={topicDraft.startTime.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })}
          onChange={handleStartTimeChange}
        />
      </div>
      <div>
        <label htmlFor="topic-duration">Duration (minutes)</label>
        <input
          id="topic-duration"
          type="number"
          value={topicDraft.durationMinutes ?? ""}
          onChange={handleDurationChange}
        />
      </div>
      <div>
        <label>
          Leader
          <OptionalPersonSelector
            selectedPerson={topicDraft.leader}
            onChange={handleLeaderChange}
          />
        </label>
      </div>
    </FormNodeControls>
  );
};

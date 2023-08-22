import "./TopicNode.css";
import { SpeakerReference } from "../../controls/SpeakerReference";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { Fragment, useCallback, useState } from "react";
import { useSessionStore } from "../../context/SessionStoreContext";
import { StoredPerson, StoredTopic } from "../../../store/types";
import { OptionalPersonSelector } from "../../controls/PersonSelector";
import { NoteNode } from "../NoteNode";
import { NewNoteNode } from "../NewNoteNode";
import { InlineNewNodeButton } from "../../controls/InlineNewNodeButton";
import { useInserting } from "../../context/InsertingContext";
import { TimePicker } from "../../controls/TimePicker";

export const NewTopicNode: React.FC<{
  miniature: boolean;
  beforeIndex?: number;
}> = ({ miniature, beforeIndex }) => {
  const [isEditing, setIsEditing] = useState(false);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const onEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  if (isEditing) {
    return <TopicEditor stopEditing={stopEditing} beforeIndex={beforeIndex} />;
  } else if (!miniature) {
    return (
      <li>
        <button className="newTopic" onClick={onEdit} aria-label="Add Topic">
          <i className="material-icons">add</i>Add Topic
        </button>
      </li>
    );
  } else {
    return (
      <InlineNewNodeButton
        index={beforeIndex}
        onClick={onEdit}
        label="Add Topic Inline"
      />
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
    <>
      {isEditing ? (
        <TopicEditor
          existingTopic={topic}
          stopEditing={() => setIsEditing(false)}
        />
      ) : (
        <TopicDisplay
          topic={topic}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

type TopicDisplayProps = {
  topic: StoredTopic;
  onEdit: () => void;
  onDelete: () => void;
};

const TopicDisplay: React.FC<TopicDisplayProps> = ({
  topic,
  onEdit,
  onDelete,
}) => {
  const isInserting = useInserting();
  return (
    <>
      <TopicHeaderDisplay topic={topic} onEdit={onEdit} onDelete={onDelete} />
      <ul>
        {topic.notes.map((note, index) => (
          <Fragment key={note.id}>
            {isInserting && (
              <NewNoteNode
                topicId={topic.id}
                alwaysExpanded={false}
                beforeIndex={index}
              />
            )}
            <NoteNode key={note.id} note={note} />
          </Fragment>
        ))}
        <NewNoteNode topicId={topic.id} alwaysExpanded />
      </ul>
    </>
  );
};

type TopicHeaderDisplayProps = {
  topic: StoredTopic;
  onEdit: () => void;
  onDelete: () => void;
};

const TopicHeaderDisplay: React.FC<TopicHeaderDisplayProps> = ({
  topic,
  onEdit,
  onDelete,
}) => {
  return (
    <NodeControls
      as="h3"
      onEdit={onEdit}
      onDelete={onDelete}
      className="topicHeader"
    >
      <div className="topicTitle">{topic.title}</div>
      <div className="topicMetadata">
        <span className="topicTime">
          {topic.startTime.toLocaleTimeString("en-US", {
            timeStyle: "short",
            timeZone: "UTC",
          })}{" "}
          {topic.durationMinutes !== undefined
            ? `for ${topic.durationMinutes} minutes`
            : null}
        </span>
        {topic.leader && (
          <span>
            Lead by <SpeakerReference speaker={topic.leader} emphasis />
          </span>
        )}
      </div>
    </NodeControls>
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
  const sessionStore = useSessionStore();
  const initialStartTime =
    sessionStore.getLastTopicEndTime(beforeIndex) ??
    sessionStore.session.metadata.startTime;

  const [topicDraft, setTopicDraft] = useState<TopicDraft>(
    existingTopic ?? { startTime: initialStartTime }
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleTitleChange = (newTitle: string) => {
    setTopicDraft({ ...topicDraft, title: newTitle });
  };

  const handleStartTimeChange = (newTime: Date) => {
    setTopicDraft({ ...topicDraft, startTime: newTime });
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
        <TimePicker
          id="topic-start-time"
          step={60}
          value={topicDraft.startTime}
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

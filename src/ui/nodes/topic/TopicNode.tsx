import { NoteNode } from "../NoteNode";
import "./TopicNode.css";
import { SpeakerReference } from "../../controls/SpeakerReference";
import { NodeControls } from "../../controls/NodeControls";
import { useCallback, useState } from "react";
import { useSessionStore } from "../../context/SessionStoreContext";
import { StoredPerson, StoredTopic } from "../../../store/SessionStore";
import { OptionalPersonSelector } from "../../controls/PersonSelector";

type TopicDraft = Partial<
  Pick<StoredTopic, "title" | "leader" | "startTime" | "durationMinutes">
>;

export const NewTopicNode: React.FC<{}> = () => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [workingTopic, setWorkingTopic] = useState<TopicDraft>({
    startTime: new Date(),
  });
  const onSave = useCallback(() => {
    if (!workingTopic.title) {
      setErrorMessage("Title cannot be empty.");
      return;
    } else if (!workingTopic.durationMinutes) {
      setErrorMessage("Duration cannot be empty.");
      return;
    } else {
      setErrorMessage(undefined);
    }
    const newTopic = workingTopic as Pick<
      StoredTopic,
      "title" | "leader" | "startTime" | "durationMinutes"
    >;
    sessionStore.addTopic(newTopic);
  }, [workingTopic]);

  const onCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const onEdit = useCallback(() => {
    setWorkingTopic({ startTime: new Date() });
    setIsEditing(true);
  }, []);

  if (isEditing) {
    return (
      <NodeControls
        isEditing={isEditing}
        onEdit={() => {
          setIsEditing(true);
        }}
        onCancel={onCancel}
        onSave={onSave}
      >
        <TopicEditor
          errorMessage={errorMessage}
          topic={workingTopic}
          onTopicUpdate={setWorkingTopic}
        />
      </NodeControls>
    );
  } else {
    return (
      <button className="newTopic" onClick={onEdit} aria-label="Add Topic">
        <i className="material-icons">add</i>Add Topic
      </button>
    );
  }
};

export const TopicNode: React.FC<{ topic: StoredTopic }> = ({ topic }) => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [workingTopic, setWorkingTopic] = useState<TopicDraft>(topic);

  const onSave = useCallback(() => {
    if (!workingTopic.title) {
      setErrorMessage("Title cannot be empty.");
      return;
    } else if (!workingTopic.durationMinutes) {
      setErrorMessage("Duration cannot be empty.");
      return;
    } else {
      setErrorMessage(undefined);
    }
    const updatedTopic = workingTopic as Pick<
      StoredTopic,
      "title" | "leader" | "startTime" | "durationMinutes"
    >;
    sessionStore.updateTopic({
      id: topic.id,
      ...updatedTopic,
    });
    setIsEditing(false);
  }, [topic, workingTopic]);

  const onCancel = useCallback(() => {
    setWorkingTopic(topic);
    setIsEditing(false);
  }, [topic]);

  const onDelete = useCallback(() => {
    sessionStore.removeTopic(topic);
  }, [topic]);
  return (
    <div>
      <NodeControls
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onDelete={onDelete}
        onCancel={onCancel}
        onSave={onSave}
      >
        {isEditing ? (
          <TopicEditor
            topic={topic}
            onTopicUpdate={setWorkingTopic}
            errorMessage={errorMessage}
          />
        ) : (
          <h3>{topic.title}</h3>
        )}
      </NodeControls>
      {!isEditing && (
        <p className="topicTime">
          {topic.startTime.toLocaleTimeString("en-US", { timeStyle: "short" })}{" "}
          for {topic.durationMinutes} minutes
        </p>
      )}
      {!isEditing && topic.leader && (
        <p>
          Lead by <SpeakerReference speaker={topic.leader} emphasis />
        </p>
      )}
      {topic.notes.map((note) => (
        <NoteNode key={note.id} note={note} />
      ))}
    </div>
  );
};

type TopicEditorProps = {
  topic: TopicDraft;
  onTopicUpdate: (topic: TopicDraft) => void;
  errorMessage: string | undefined;
};

export const TopicEditor: React.FC<TopicEditorProps> = ({
  topic,
  onTopicUpdate,
  errorMessage,
}) => {
  const [workingTitle, setWorkingTitle] = useState(topic.title);
  const [workingStartTime, setWorkingStartTime] = useState(
    topic.startTime ?? new Date()
  );
  const [workingDuration, setWorkingDuration] = useState(topic.durationMinutes);
  const [workingLeader, setWorkingLeader] = useState(topic.leader);

  const handleTitleChange = (newTitle: string) => {
    setWorkingTitle(newTitle);
    onTopicUpdate({ ...topic, title: newTitle });
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = new Date(topic.startTime ?? new Date());
    const [hours, minutes] = event.target.value.split(":");
    newDate.setHours(parseInt(hours));
    newDate.setMinutes(parseInt(minutes));
    setWorkingStartTime(newDate);
    onTopicUpdate({ ...topic, startTime: newDate });
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const duration = event.target.valueAsNumber;
    setWorkingDuration(duration);
    onTopicUpdate({ ...topic, durationMinutes: duration });
  };

  const handleLeaderChange = (newLeader: StoredPerson | undefined) => {
    setWorkingLeader(newLeader);
    onTopicUpdate({ ...topic, leader: newLeader });
  };

  return (
    <form className="topic">
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <div>
        <label htmlFor="topic-title">Title</label>
        <input
          id="topic-title"
          type="text"
          value={workingTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="topic-start-time">Start Time</label>
        <input
          id="topic-start-time"
          type="time"
          value={`${workingStartTime.getHours()}:${workingStartTime.getMinutes()}`}
          onChange={handleStartTimeChange}
        />
      </div>
      <div>
        <label htmlFor="topic-duration">Duration (minutes)</label>
        <input
          id="topic-duration"
          type="number"
          value={workingDuration}
          onChange={handleDurationChange}
        />
      </div>
      <div>
        <label>
          Leader
          <OptionalPersonSelector
            selectedPerson={workingLeader}
            onChange={handleLeaderChange}
          />
        </label>
      </div>
    </form>
  );
};

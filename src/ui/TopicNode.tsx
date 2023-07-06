import { Topic } from "minute-model";
import { NoteNode } from "./NoteNode";
import "./TopicNode.css";
import { SpeakerReference } from "./SpeakerReference";
import { NodeControls } from "./NodeControls";
import { useCallback, useState } from "react";
import { Immutable } from "../store/SessionStore";
import { useSessionStore } from "../store/SessionStoreContext";

export const TopicNode: React.FC<{ topic: Immutable<Topic> }> = ({ topic }) => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(topic.title);
  const onSave = useCallback(() => {
    sessionStore.setTopics(
      sessionStore.topics.map((t) => {
        if (t === topic) {
          t.title = workingTitle;
        }
        return t;
      })
    )
    setIsEditing(false);
  }, [topic, workingTitle]);
  const onCancel = useCallback(() => {
    setWorkingTitle(topic.title);
    setIsEditing(false);
  }, [topic]);
  return (
    <div>
      <NodeControls
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={onCancel}
        onSave={onSave}
      >
        <Title
          workingTitle={workingTitle}
          isEditing={isEditing}
          onTitleChange={setWorkingTitle}
        />
      </NodeControls>
      {topic.leader && (
        <p>
          Lead by <SpeakerReference speaker={topic.leader} emphasis />
        </p>
      )}
      {topic.notes.map((note) => (
        <NoteNode note={note} />
      ))}
    </div>
  );
};

type TitleProps = {
  workingTitle: string;
  isEditing: boolean;
  onTitleChange: (newTitle: string) => void;
};

const Title = ({ workingTitle, isEditing, onTitleChange }: TitleProps) => {
  if (isEditing) {
    return (
      <input
        type="text"
        value={workingTitle}
        onChange={(e) => onTitleChange(e.target.value)}
      />
    );
  } else {
    return <h3>{workingTitle}</h3>;
  }
};

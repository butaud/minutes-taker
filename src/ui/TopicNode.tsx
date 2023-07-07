import { NoteNode } from "./NoteNode";
import "./TopicNode.css";
import { SpeakerReference } from "./SpeakerReference";
import { NodeControls } from "./NodeControls";
import { useCallback, useState } from "react";
import { useSessionStore } from "./context/SessionStoreContext";
import { StoredTopic } from "../store/SessionStore";

export const TopicNode: React.FC<{ topic: StoredTopic }> = ({ topic }) => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(topic.title);

  const onSave = useCallback(() => {
    sessionStore.updateTopic({ ...topic, title: workingTitle });
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

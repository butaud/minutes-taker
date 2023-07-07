import { useCallback, useState } from "react";
import { NodeControls } from "../../controls/NodeControls";
import { SpeakerReference } from "../../controls/SpeakerReference";
import "./TextNoteNode.css";
import { StoredTextNote } from "../../../store/SessionStore";
import { useSessionStore } from "../../context/SessionStoreContext";

export const TextNoteNode: React.FC<{ note: StoredTextNote }> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);

  const sessionStore = useSessionStore();

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setText(event.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    sessionStore.updateNote({
      ...note,
      text,
    });
    setIsEditing(false);
  }, [note, text]);

  const handleCancel = useCallback(() => {
    setText(note.text);
    setIsEditing(false);
  }, [note]);

  return (
    <NodeControls
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <div>
        <p>
          {note.speaker && <SpeakerReference speaker={note.speaker} />}
          {note.speaker && ":"}{" "}
          {isEditing ? (
            <input
              className="tnn-input"
              type="text"
              value={text}
              onChange={handleTextChange}
            />
          ) : (
            note.text
          )}
        </p>
      </div>
    </NodeControls>
  );
};

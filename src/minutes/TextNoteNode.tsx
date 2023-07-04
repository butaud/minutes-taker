import { useCallback, useState } from "react";
import { TextNote } from "minute-model";
import { NodeControls } from "./NodeControls";
import { SpeakerReference } from "./SpeakerReference";
import "./TextNoteNode.css";

export const TextNoteNode: React.FC<{ note: TextNote }> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setText(event.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    note.text = text;
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
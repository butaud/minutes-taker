import { useState } from "react";
import { ActionItemNote } from "minute-model";
import { NodeControls } from "./NodeControls";
import { SpeakerReference } from "./SpeakerReference";

import "./ActionItemNoteNode.css";

export const ActionItemNoteNode: React.FC<{ note: ActionItemNote }> = ({
  note,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [dueDate, setDueDate] = useState(note.dueDate);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    const offset = date.getTimezoneOffset();
    date.setTime(date.getTime() - offset * 60 * 1000);
    setDueDate(date);
  };

  const handleSave = () => {
    note.text = text;
    note.dueDate = dueDate;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(note.text);
    setDueDate(note.dueDate);
    setIsEditing(false);
  };

  return (
    <NodeControls
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <div>
        <p>
          <em>Action item:</em>{" "}
          {isEditing ? (
            <>
              <input
                className="ainn-text-input"
                type="text"
                value={text}
                onChange={handleTextChange}
              />
              <input
                type="date"
                value={dueDate?.toISOString().substr(0, 10)}
                onChange={handleDueDateChange}
              />
            </>
          ) : (
            <>
              <SpeakerReference speaker={note.assignee} emphasis /> to{" "}
              {note.text}{" "}
              {note.dueDate && "by " + note.dueDate.toLocaleDateString()}.
            </>
          )}
        </p>
      </div>
    </NodeControls>
  );
};

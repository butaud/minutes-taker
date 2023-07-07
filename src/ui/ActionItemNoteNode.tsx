import { useState } from "react";
import { NodeControls } from "./NodeControls";
import { SpeakerReference } from "./SpeakerReference";

import "./ActionItemNoteNode.css";
import { StoredActionItemNote, StoredPerson } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";
import { PersonSelector } from "./PersonSelector";

export const ActionItemNoteNode: React.FC<{ note: StoredActionItemNote }> = ({
  note,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [dueDate, setDueDate] = useState(note.dueDate);
  const [assignee, setAssignee] = useState(note.assignee);

  const sessionStore = useSessionStore();

  const handleAssigneeChange = (newAssignee: StoredPerson) => {
    setAssignee(newAssignee);
  };

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
    sessionStore.updateNote({
      ...note,
      text,
      dueDate,
      assignee,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(note.text);
    setDueDate(note.dueDate);
    setIsEditing(false);
    setAssignee(note.assignee);
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
              <PersonSelector
                selectedPerson={note.assignee}
                onChange={handleAssigneeChange}
              />
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

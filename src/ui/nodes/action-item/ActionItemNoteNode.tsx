import { useState } from "react";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { SpeakerReference } from "../../controls/SpeakerReference";

import "./ActionItemNoteNode.css";
import {
  StoredActionItemNote,
  StoredPerson,
} from "../../../store/SessionStore";
import { useSessionStore } from "../../context/SessionStoreContext";
import { PersonSelector } from "../../controls/PersonSelector";

export const ActionItemNoteNode: React.FC<{ note: StoredActionItemNote }> = ({
  note,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const stopEditing = () => {
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  return isEditing ? (
    <ActionItemNoteEditor existingNote={note} stopEditing={stopEditing} />
  ) : (
    <ActionItemNoteDisplay note={note} onEdit={startEditing} />
  );
};

type ActionItemNoteDisplayProps = {
  note: StoredActionItemNote;
  onEdit: () => void;
};

export const ActionItemNoteDisplay: React.FC<ActionItemNoteDisplayProps> = ({
  note,
  onEdit,
}) => {
  const sessionStore = useSessionStore();
  return (
    <NodeControls
      as="li"
      onEdit={onEdit}
      onDelete={() => sessionStore.removeNote(note)}
    >
      <p>
        <em>Action item:</em>{" "}
        <SpeakerReference speaker={note.assignee} emphasis /> to {note.text}{" "}
        {note.dueDate &&
          "by " + note.dueDate.toLocaleDateString("en-US", { timeZone: "UTC" })}
        .
      </p>
    </NodeControls>
  );
};

type ActionItemNoteEditorProps = {
  existingNote?: StoredActionItemNote;
  topicId?: number;
  beforeIndex?: number;
  stopEditing: () => void;
};

export const ActionItemNoteEditor: React.FC<ActionItemNoteEditorProps> = ({
  existingNote,
  topicId,
  beforeIndex,
  stopEditing,
}) => {
  const [text, setText] = useState(existingNote?.text || "");
  const [dueDate, setDueDate] = useState(existingNote?.dueDate);
  const [assignee, setAssignee] = useState(existingNote?.assignee);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const sessionStore = useSessionStore();

  if (!existingNote && topicId === undefined) {
    throw new Error("Must provide topicId if creating a new note");
  }

  const handleAssigneeChange = (newAssignee: StoredPerson) => {
    setAssignee(newAssignee);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setDueDate(date);
  };

  const handleSubmit = () => {
    if (!text) {
      setErrorMessage("Action item text cannot be empty.");
      return;
    }
    if (!assignee) {
      setErrorMessage("Assignee cannot be empty.");
      return;
    }
    if (!dueDate) {
      setErrorMessage("Due date cannot be empty.");
      return;
    }
    setErrorMessage(undefined);

    if (existingNote) {
      sessionStore.updateNote({
        ...existingNote,
        text,
        dueDate,
        assignee,
      });
    } else if (topicId !== undefined) {
      sessionStore.addNote(
        topicId,
        {
          type: "actionItem",
          text,
          dueDate,
          assignee,
        },
        beforeIndex
      );
    }
    stopEditing();
  };

  const handleCancel = () => {
    setErrorMessage(undefined);
    stopEditing();
  };

  return (
    <FormNodeControls
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      className="actionItem"
    >
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <em>Action item:</em>{" "}
      <PersonSelector
        selectedPerson={assignee}
        onChange={handleAssigneeChange}
        ariaLabel="Assignee"
      />
      <input
        aria-label="Action item text"
        className="ainn-text-input"
        type="text"
        value={text ?? ""}
        onChange={handleTextChange}
      />
      <input
        aria-label="Action item due date"
        type="date"
        value={dueDate?.toISOString().substr(0, 10) ?? ""}
        onChange={handleDueDateChange}
      />
    </FormNodeControls>
  );
};

import { FunctionComponent, useCallback, useState } from "react";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import "./TextNoteNode.css";
import { StoredTextNote } from "../../../store/types";
import { useSessionStore } from "../../context/SessionStoreContext";

export const TextNoteNode: React.FC<{ note: StoredTextNote }> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);

  const sessionStore = useSessionStore();

  const handleDelete = () => {
    sessionStore.removeNote(note);
  };

  return isEditing ? (
    <TextNoteEditor
      existingNote={note}
      stopEditing={() => setIsEditing(false)}
    />
  ) : (
    <NodeControls
      as="li"
      onEdit={() => setIsEditing(true)}
      onDelete={handleDelete}
    >
      <p>{note.text}</p>
    </NodeControls>
  );
};

type TextNoteDraft = {
  text?: string;
};

type TextNoteEditorProps = {
  existingNote?: StoredTextNote;
  stopEditing: () => void;
  topicId?: number;
  beforeIndex?: number;
};

export const TextNoteEditor: FunctionComponent<TextNoteEditorProps> = ({
  existingNote,
  stopEditing,
  topicId,
  beforeIndex,
}) => {
  const [draft, setDraft] = useState<TextNoteDraft>({ ...existingNote });
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const sessionStore = useSessionStore();

  // watch out for topicId of 0 (falsy)
  if (!existingNote && topicId === undefined) {
    throw new Error("Must provide either existing note or topic ID");
  }

  const handleSubmit = useCallback(() => {
    if (!draft.text) {
      setErrorMessage("Text cannot be empty.");
      return;
    }
    setErrorMessage(undefined);
    if (existingNote) {
      sessionStore.updateNote({
        text: draft.text,
        type: "text",
        id: existingNote.id,
      });
    } else if (topicId !== undefined) {
      sessionStore.addNote(
        topicId,
        { type: "text", text: draft.text },
        beforeIndex
      );
    }
    stopEditing();
  }, [draft]);

  const handleCancel = useCallback(() => {
    setDraft({ ...existingNote });
    setErrorMessage(undefined);
    stopEditing();
  }, [existingNote]);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft({ text: event.target.value });
    },
    []
  );

  return (
    <FormNodeControls
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      className="text"
    >
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <i className="material-icons">add</i>
      <input
        autoFocus
        className="tnn-input"
        type="text"
        value={draft.text ?? ""}
        onChange={handleTextChange}
        aria-label="Text"
      />
    </FormNodeControls>
  );
};

import { FunctionComponent, useCallback, useState } from "react";
import { NodeControls } from "../../controls/NodeControls";
import "./TextNoteNode.css";
import { StoredTextNote } from "../../../store/SessionStore";
import { useSessionStore } from "../../context/SessionStoreContext";
import { NewNoteEditorProps } from "../NewNoteNode";

export const NewTextNoteEditor: React.FC<NewNoteEditorProps> = ({
  topicId,
  stopAdding,
}) => {
  const sessionStore = useSessionStore();
  const [noteDraft, setNoteDraft] = useState<TextNoteDraft>({});
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSave = useCallback(() => {
    if (!noteDraft.text) {
      setErrorMessage("Text cannot be empty.");
      return;
    }
    setErrorMessage(undefined);
    sessionStore.addNote(topicId, { type: "text", text: noteDraft.text });
    stopAdding();
  }, [noteDraft, stopAdding]);

  const handleCancel = useCallback(() => {
    setNoteDraft({});
    setErrorMessage(undefined);
    stopAdding();
  }, [stopAdding]);

  return (
    <NodeControls
      isEditing={true}
      onEdit={() => {}}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <TextNoteEditor
        draft={noteDraft}
        onDraftUpdate={setNoteDraft}
        errorMessage={errorMessage}
      />
    </NodeControls>
  );
};

export const TextNoteNode: React.FC<{ note: StoredTextNote }> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState<TextNoteDraft>(note);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const sessionStore = useSessionStore();

  const handleSave = useCallback(() => {
    if (!noteDraft.text) {
      setErrorMessage("Text cannot be empty.");
      return;
    }
    setErrorMessage(undefined);
    sessionStore.updateNote({
      ...note,
      ...noteDraft,
    });
    setIsEditing(false);
    setNoteDraft(note);
  }, [note, noteDraft]);

  const handleCancel = useCallback(() => {
    setErrorMessage(undefined);
    setNoteDraft(note);
    setIsEditing(false);
  }, [note]);

  const handleDelete = () => {
    sessionStore.removeNote(note);
  };

  return (
    <NodeControls
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
    >
      {isEditing ? (
        <TextNoteEditor
          draft={noteDraft}
          onDraftUpdate={setNoteDraft}
          errorMessage={errorMessage}
        />
      ) : (
        <p>{note.text}</p>
      )}
    </NodeControls>
  );
};

type TextNoteDraft = {
  text?: string;
};

type TextNoteEditorProps = {
  draft: TextNoteDraft;
  onDraftUpdate: (draft: TextNoteDraft) => void;
  errorMessage: string | undefined;
};

const TextNoteEditor: FunctionComponent<TextNoteEditorProps> = ({
  draft,
  errorMessage,
  onDraftUpdate,
}) => {
  const [textValue, setTextValue] = useState(draft.text);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTextValue(event.target.value);
      onDraftUpdate({
        ...draft,
        text: event.target.value,
      });
    },
    []
  );

  return (
    <p>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <input
        autoFocus
        className="tnn-input"
        type="text"
        value={textValue}
        onChange={handleTextChange}
        aria-label="Text"
      />
    </p>
  );
};

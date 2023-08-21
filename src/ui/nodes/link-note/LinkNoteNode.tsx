import { FunctionComponent, useCallback, useState } from "react";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import "./LinkNoteNode.css";
import { StoredLinkNote } from "../../../store/types";
import { useSessionStore } from "../../context/SessionStoreContext";

export const LinkNoteNode: React.FC<{ note: StoredLinkNote }> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);

  const sessionStore = useSessionStore();

  const handleDelete = () => {
    sessionStore.removeNote(note);
  };

  return isEditing ? (
    <LinkNoteEditor
      existingNote={note}
      stopEditing={() => setIsEditing(false)}
    />
  ) : (
    <NodeControls
      as="li"
      onEdit={() => setIsEditing(true)}
      onDelete={handleDelete}
    >
      <a href={note.url}>{note.text}</a>
    </NodeControls>
  );
};

type LinkNoteDraft = {
  text?: string;
  url?: string;
};

type LinkNoteEditorProps = {
  existingNote?: StoredLinkNote;
  stopEditing: () => void;
  topicId?: number;
  beforeIndex?: number;
};

export const LinkNoteEditor: FunctionComponent<LinkNoteEditorProps> = ({
  existingNote,
  stopEditing,
  topicId,
  beforeIndex,
}) => {
  const [draft, setDraft] = useState<LinkNoteDraft>({ ...existingNote });
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
    if (!draft.url) {
      setErrorMessage("URL cannot be empty.");
      return;
    }
    setErrorMessage(undefined);
    if (existingNote) {
      sessionStore.updateNote({
        text: draft.text,
        url: draft.url,
        type: "link",
        id: existingNote.id,
      });
    } else if (topicId !== undefined) {
      sessionStore.addNote(
        topicId,
        { type: "link", text: draft.text, url: draft.url },
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
      setDraft({ ...draft, text: event.target.value });
    },
    [draft]
  );

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft({ ...draft, url: event.target.value });
    },
    [draft]
  );

  return (
    <FormNodeControls
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      className="link-editor"
    >
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <i className="material-icons">add</i>
      <label>
        Text
        <input
          autoFocus
          type="text"
          value={draft.text ?? ""}
          onChange={handleTextChange}
          aria-label="Text"
          className="text"
        />
      </label>
      <label>
        URL
        <input
          type="text"
          value={draft.url ?? ""}
          onChange={handleUrlChange}
          aria-label="URL"
          className="url"
        />
      </label>
    </FormNodeControls>
  );
};

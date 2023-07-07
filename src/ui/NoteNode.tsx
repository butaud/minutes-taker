import { TextNoteNode } from "./TextNoteNode";
import { ActionItemNoteNode } from "./ActionItemNoteNode";
import { MotionNoteNode } from "./MotionNoteNode";
import { StoredNote } from "../store/SessionStore";
import {
  isStoredActionItemNote,
  isStoredTextNote,
  isStoredMotionNote,
} from "../util/types";

export const NoteNode: React.FC<{ note: StoredNote }> = ({ note }) => {
  if (isStoredTextNote(note)) {
    return <TextNoteNode note={note} />;
  } else if (isStoredActionItemNote(note)) {
    return <ActionItemNoteNode note={note} />;
  } else if (isStoredMotionNote(note)) {
    return <MotionNoteNode note={note} />;
  } else {
    return null;
  }
};

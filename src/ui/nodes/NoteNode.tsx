import { TextNoteNode } from "./text/TextNoteNode";
import { ActionItemNoteNode } from "./action-item/ActionItemNoteNode";
import { MotionNoteNode } from "./motion/MotionNoteNode";
import { StoredNote } from "../../store/types";
import {
  isStoredActionItemNote,
  isStoredTextNote,
  isStoredMotionNote,
  isStoredLinkNote,
} from "../../util/types";
import { LinkNoteNode } from "./link-note/LinkNoteNode";

export const NoteNode: React.FC<{ note: StoredNote }> = ({ note }) => {
  if (isStoredTextNote(note)) {
    return <TextNoteNode note={note} />;
  } else if (isStoredActionItemNote(note)) {
    return <ActionItemNoteNode note={note} />;
  } else if (isStoredMotionNote(note)) {
    return <MotionNoteNode note={note} />;
  } else if (isStoredLinkNote(note)) {
    return <LinkNoteNode note={note} />;
  } else {
    return null;
  }
};

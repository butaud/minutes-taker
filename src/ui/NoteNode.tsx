import { TextNote, ActionItemNote, MotionNote, Note } from "minute-model";
import { TextNoteNode } from "./TextNoteNode";
import { ActionItemNoteNode } from "./ActionItemNoteNode";
import { MotionNoteNode } from "./MotionNoteNode";

const isTextNote = (note: Note): note is TextNote => {
  return note.type === "text";
};

const isActionItemNote = (note: Note): note is ActionItemNote => {
  return note.type === "actionItem";
};

const isMotionNote = (note: Note): note is MotionNote => {
  return note.type === "motion";
};

export const NoteNode: React.FC<{ note: Note }> = ({ note }) => {
  if (isTextNote(note)) {
    return <TextNoteNode note={note} />;
  } else if (isActionItemNote(note)) {
    return <ActionItemNoteNode note={note} />;
  } else if (isMotionNote(note)) {
    return <MotionNoteNode note={note} />;
  } else {
    return null;
  }
};

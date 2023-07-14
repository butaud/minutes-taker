import { Note, TextNote, ActionItemNote, MotionNote } from "minutes-model";
import {
  StoredActionItemNote,
  StoredMotionNote,
  StoredNote,
  StoredTextNote,
} from "../store/SessionStore";

export const isStoredTextNote = (note: StoredNote): note is StoredTextNote => {
  return note.type === "text";
};

export const isStoredActionItemNote = (
  note: StoredNote
): note is StoredActionItemNote => {
  return note.type === "actionItem";
};

export const isStoredMotionNote = (
  note: StoredNote
): note is StoredMotionNote => {
  return note.type === "motion";
};

export const isTextNote = (note: Note): note is TextNote => {
  return note.type === "text";
};

export const isActionItemNote = (note: Note): note is ActionItemNote => {
  return note.type === "actionItem";
};

export const isMotionNote = (note: Note): note is MotionNote => {
  return note.type === "motion";
};

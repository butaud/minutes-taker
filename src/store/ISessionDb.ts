import { StoredSession } from "./types";

export interface ISessionDb {
  history: readonly StoredSession[];
  pushHistory: (session: StoredSession) => void;
  popHistory: () => void;
  undoHistory: readonly StoredSession[];
  pushUndoHistory: (session: StoredSession) => void;
  popUndoHistory: () => void;
  currentSession: StoredSession;
  personId: number;
  topicId: number;
  noteId: number;
  calendarItemId: number;
  committeeId: number;
  pastActionItemId: number;
}

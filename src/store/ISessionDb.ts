import { StoredSession } from "./types";

export interface ISessionDb {
  history: StoredSession[];
  undoHistory: StoredSession[];
  currentSession: StoredSession;
  personId: number;
  topicId: number;
  noteId: number;
  calendarItemId: number;
  committeeId: number;
  pastActionItemId: number;
}

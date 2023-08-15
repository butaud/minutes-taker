import { ISessionDb } from "./ISessionDb";
import { StoredSession } from "./types";

export class MemorySessionDb implements ISessionDb {
  history = [];
  undoHistory = [];
  currentSession: StoredSession;
  personId = 0;
  topicId = 0;
  noteId = 0;
  calendarItemId = 0;
  committeeId = 0;
  pastActionItemId = 0;

  constructor(session: StoredSession) {
    this.currentSession = session;
  }
}

import { ISessionDb } from "./ISessionDb";
import { StoredSession, emptySession } from "./types";

export class MemorySessionDb implements ISessionDb {
  history: StoredSession[] = [];
  undoHistory: StoredSession[] = [];
  currentSession: StoredSession;
  personId = 0;
  topicId = 0;
  noteId = 0;
  calendarItemId = 0;
  committeeId = 0;
  pastActionItemId = 0;

  constructor() {
    this.currentSession = emptySession;
  }

  pushHistory(session: StoredSession) {
    this.history.push(session);
  }

  popHistory() {
    this.history.pop();
  }

  pushUndoHistory(session: StoredSession) {
    this.undoHistory.push(session);
  }

  popUndoHistory() {
    this.undoHistory.pop();
  }
}

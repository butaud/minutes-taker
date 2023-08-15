import { dateTimeReviver } from "../fs/io";
import { ISessionDb } from "./ISessionDb";
import { StoredSession, emptySession } from "./types";

const getDefiniteLocalStorageValue = (key: string): string => {
  const value = localStorage.getItem(key);
  if (value === null) {
    throw new Error(`No value found for key ${key}`);
  }
  return value;
};

const parseDefiniteLocalStorageValue = <T>(key: string): T => {
  const value = getDefiniteLocalStorageValue(key);
  return JSON.parse(value, dateTimeReviver);
};

export class LocalStorageSessionDb implements ISessionDb {
  constructor() {
    if (!this.initialized) {
      this.currentSession = emptySession;
      this.history = [];
      this.undoHistory = [];
      this.personId = 0;
      this.topicId = 0;
      this.noteId = 0;
      this.calendarItemId = 0;
      this.committeeId = 0;
      this.pastActionItemId = 0;
      this.initialized = true;
    }
  }

  set initialized(initialized: boolean) {
    localStorage.setItem("initialized", JSON.stringify(initialized));
  }

  get initialized(): boolean {
    return !!localStorage.getItem("initialized");
  }

  set currentSession(session: StoredSession) {
    localStorage.setItem("currentSession", JSON.stringify(session));
  }

  get currentSession(): StoredSession {
    return parseDefiniteLocalStorageValue("currentSession");
  }

  set history(history: StoredSession[]) {
    localStorage.setItem("history", JSON.stringify(history));
  }

  get history(): StoredSession[] {
    return parseDefiniteLocalStorageValue("history");
  }

  pushHistory(session: StoredSession) {
    this.history = [...this.history, session];
  }

  popHistory: () => void = () => {
    if (this.history.length > 0) {
      this.history = this.history.slice(0, this.history.length - 1);
    }
  };

  set undoHistory(undoHistory: StoredSession[]) {
    localStorage.setItem("undoHistory", JSON.stringify(undoHistory));
  }

  get undoHistory(): StoredSession[] {
    return parseDefiniteLocalStorageValue("undoHistory");
  }

  pushUndoHistory(session: StoredSession) {
    this.undoHistory = [...this.undoHistory, session];
  }

  popUndoHistory: () => void = () => {
    if (this.undoHistory.length > 0) {
      this.undoHistory = this.undoHistory.slice(0, this.undoHistory.length - 1);
    }
  };

  set personId(personId: number) {
    localStorage.setItem("personId", JSON.stringify(personId));
  }

  get personId(): number {
    return parseDefiniteLocalStorageValue("personId");
  }

  set topicId(topicId: number) {
    localStorage.setItem("topicId", JSON.stringify(topicId));
  }

  get topicId(): number {
    return parseDefiniteLocalStorageValue("topicId");
  }

  set noteId(noteId: number) {
    localStorage.setItem("noteId", JSON.stringify(noteId));
  }

  get noteId(): number {
    return parseDefiniteLocalStorageValue("noteId");
  }

  set calendarItemId(calendarItemId: number) {
    localStorage.setItem("calendarItemId", JSON.stringify(calendarItemId));
  }

  get calendarItemId(): number {
    return parseDefiniteLocalStorageValue("calendarItemId");
  }

  set committeeId(committeeId: number) {
    localStorage.setItem("committeeId", JSON.stringify(committeeId));
  }

  get committeeId(): number {
    return parseDefiniteLocalStorageValue("committeeId");
  }

  set pastActionItemId(pastActionItemId: number) {
    localStorage.setItem("pastActionItemId", JSON.stringify(pastActionItemId));
  }

  get pastActionItemId(): number {
    return parseDefiniteLocalStorageValue("pastActionItemId");
  }
}

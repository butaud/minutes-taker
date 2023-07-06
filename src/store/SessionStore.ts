import { Person, Session, SessionMetadata, Topic, Note } from "minute-model";
import { Immutable, produce } from "immer";

type StoredNote = Note & {
  id: string;
};

type StoredTopic = Topic & {
  id: string;
  notes: StoredNote[];
};

type StoredPerson = Person & {
  id: string;
};

type StoredSessionMetadata = SessionMetadata & {
  membersPresent: StoredPerson[];
  membersAbsent: StoredPerson[];
  administrationPresent: StoredPerson[];
};

export type StoredSession = Immutable<{
  metadata: StoredSessionMetadata;
  topics: StoredTopic[];
}>;

export class SessionStore {
  _history: StoredSession[] = [];
  _undoHistory: StoredSession[] = [];
  _session: StoredSession;
  callbacks: ((session: StoredSession) => void)[] = [];

  constructor(session: Session) {
    this._session = this.convertSession(session);
  }

  private convertSession(session: Session): StoredSession {
    return {
      metadata: this.convertSessionMetadata(session.metadata),
      topics: this.convertTopics(session.topics),
    };
  }

  private convertSessionMetadata(
    metadata: SessionMetadata
  ): StoredSessionMetadata {
    let personId = 0;
    const personListConverter = (people: Person[]) => {
      return people.map((person) => ({
        ...person,
        id: `${personId++}`,
      }));
    };
    return {
      ...metadata,
      membersPresent: personListConverter(metadata.membersPresent),
      membersAbsent: personListConverter(metadata.membersAbsent),
      administrationPresent: personListConverter(
        metadata.administrationPresent
      ),
    };
  }

  private convertTopics(topic: Topic[]): StoredTopic[] {
    let topicId = 0;
    let noteId = 0;
    const noteListConverter = (notes: Note[]) => {
      return notes.map((note) => ({
        ...note,
        id: `${noteId++}`,
      }));
    };
    return topic.map((topic) => ({
      ...topic,
      id: `${topicId++}`,
      notes: noteListConverter(topic.notes),
    }));
  }

  private updateSession(session: StoredSession, isUndo: boolean = false) {
    if (isUndo) {
      this._undoHistory.push(this._session);
      this._history.pop();
    } else {
      this._history.push(this._session);
      this._undoHistory = [];
    }
    this._session = session;
    this.callbacks.forEach((cb) => cb(this._session));
  }

  get session() {
    return this._session;
  }

  subscribe(callback: (session: StoredSession) => void) {
    this.callbacks.push(callback);
  }

  unsubscribe(callback: (session: StoredSession) => void) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  undo() {
    if (this._history.length > 0) {
      this.updateSession(this._history[this._history.length - 1], true);
    }
  }

  redo() {
    if (this._undoHistory.length > 0) {
      this.updateSession(this._undoHistory[this._undoHistory.length - 1]);
    }
  }

  private updateMetadata(metadata: StoredSessionMetadata) {
    this.updateSession(
      produce(this._session, (draft) => (draft.metadata = metadata))
    );
  }

  private updateMembersPresent(membersPresent: StoredPerson[]) {
    this.updateMetadata({
      ...this._session.metadata,
      membersPresent,
    });
  }

  private updateMembersAbsent(membersAbsent: StoredPerson[]) {
    this.updateMetadata({
      ...this._session.metadata,
      membersAbsent,
    });
  }

  private updateAdministrationPresent(administrationPresent: StoredPerson[]) {
    this.updateMetadata({
      ...this._session.metadata,
      administrationPresent,
    });
  }

  setStartTime(startTime: Date) {
    this.updateSession({
      ...this._session,
      metadata: { ...this._session.metadata, startTime },
    });
  }

  addMemberPresent(member: StoredPerson) {
    this.updateMembersPresent([
      ...this._session.metadata.membersPresent,
      member,
    ]);
  }

  removeMemberPresent(member: StoredPerson) {
    this.updateMembersPresent(
      this._session.metadata.membersPresent.filter((m) => m.id !== member.id)
    );
  }
  addMemberAbsent(member: StoredPerson) {
    this.updateMembersAbsent([...this._session.metadata.membersAbsent, member]);
  }

  removeMemberAbsent(member: StoredPerson) {
    this.updateMembersAbsent(
      this._session.metadata.membersAbsent.filter((m) => m.id !== member.id)
    );
  }

  addAdministrationPresent(member: StoredPerson) {
    this.updateAdministrationPresent([
      ...this._session.metadata.administrationPresent,
      member,
    ]);
  }

  setLocation(location: string) {
    this.updateSession({
      ...this._session,
      metadata: { ...this._session.metadata, location },
    });
  }

  setTopics(topics: readonly Immutable<Topic>[]) {
    this.updateSession({
      ...this._session,
      topics,
    });
  }
}

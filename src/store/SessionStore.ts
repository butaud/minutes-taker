import { Person, Session, SessionMetadata, Topic, Note } from "minute-model";
import { produce, Immutable } from "immer";

type StoredNote = Note & {
  id: number;
};

type StoredTopic = Omit<Topic, "notes" | "leader"> & {
  id: number;
  notes: StoredNote[];
  leader?: StoredPerson;
};

type StoredPerson = Person & {
  id: number;
};

type StoredSessionMetadata = Omit<
  SessionMetadata,
  "membersPresent" | "membersAbsent" | "administrationPresent"
> & {
  membersPresent: StoredPerson[];
  membersAbsent: StoredPerson[];
  administrationPresent: StoredPerson[];
};

type StoredSession = {
  metadata: StoredSessionMetadata;
  topics: StoredTopic[];
};

export class SessionStore {
  _history: StoredSession[] = [];
  _undoHistory: StoredSession[] = [];
  _session: StoredSession;
  _allPeople: StoredPerson[] = [];
  callbacks: ((session: Immutable<Session>) => void)[] = [];
  personId = 0;
  topicId = 0;
  noteId = 0;

  constructor(session: Session) {
    this._session = this.convertSession(session);
  }

  private convertSession(session: Session): StoredSession {
    const sessionMetadata = this.convertSessionMetadata(session.metadata);
    this._allPeople = [
      ...sessionMetadata.membersPresent,
      ...sessionMetadata.membersAbsent,
      ...sessionMetadata.administrationPresent,
    ];
    return {
      metadata: sessionMetadata,
      topics: this.convertTopics(session.topics),
    };
  }

  private findPerson(person: Person): StoredPerson | undefined {
    return this._allPeople.find(
      (p) => p.firstName === person.firstName && p.lastName === person.lastName
    );
  }

  private convertSessionMetadata(
    metadata: SessionMetadata
  ): StoredSessionMetadata {
    const personListConverter = (people: Person[]) => {
      return people.map((person) => ({
        ...person,
        id: this.personId++,
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

  private convertTopics(topics: Topic[]): StoredTopic[] {
    const noteListConverter = (notes: Note[]) => {
      return notes.map((note) => ({
        ...note,
        id: this.noteId++,
      }));
    };
    return topics.map((topic) => ({
      ...topic,
      id: this.topicId++,
      notes: noteListConverter(topic.notes),
      leader: topic.leader && this.findPerson(topic.leader),
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

  private produceUpdate(
    update: (draft: StoredSession) => void,
    isUndo: boolean = false
  ) {
    this.updateSession(produce(this._session, update), isUndo);
  }

  get session() {
    return this._session;
  }

  subscribe(callback: (session: Immutable<Session>) => void) {
    this.callbacks.push(callback);
  }

  unsubscribe(callback: (session: Immutable<Session>) => void) {
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

  setStartTime(startTime: Date) {
    this.produceUpdate((draft) => {
      draft.metadata.startTime = startTime;
    });
  }

  addMemberPresent(member: Immutable<Person>) {
    this.produceUpdate((draft) => {
      draft.metadata.membersPresent.push({ ...member, id: this.personId++ });
    });
  }

  removeMemberPresent(id: number) {
    this.produceUpdate((draft) => {
      draft.metadata.membersPresent = draft.metadata.membersPresent.filter(
        (m) => m.id !== id
      );
    });
  }

  updateMemberPresent(id: number, member: Immutable<Person>) {
    this.produceUpdate((draft) => {
      const index = draft.metadata.membersPresent.findIndex((m) => m.id === id);
      draft.metadata.membersPresent[index] = {
        ...member,
        id: draft.metadata.membersPresent[index].id,
      };
    });
  }

  addMemberAbsent(member: Immutable<Person>) {
    this.produceUpdate((draft) => {
      draft.metadata.membersAbsent.push({ ...member, id: this.personId++ });
    });
  }

  removeMemberAbsent(id: number) {
    this.produceUpdate((draft) => {
      draft.metadata.membersAbsent = draft.metadata.membersAbsent.filter(
        (m) => m.id !== id
      );
    });
  }

  updateMemberAbsent(id: number, member: Immutable<Person>) {
    this.produceUpdate((draft) => {
      const index = draft.metadata.membersAbsent.findIndex((m) => m.id === id);
      draft.metadata.membersAbsent[index] = {
        ...member,
        id: draft.metadata.membersAbsent[index].id,
      };
    });
  }

  addAdministrationPresent(member: Immutable<Person>) {
    this.produceUpdate((draft) => {
      draft.metadata.administrationPresent.push({
        ...member,
        id: this.personId++,
      });
    });
  }

  removeAdministrationPresent(id: number) {
    this.produceUpdate((draft) => {
      draft.metadata.administrationPresent =
        draft.metadata.administrationPresent.filter((m) => m.id !== id);
    });
  }

  updateAdministrationPresent(id: number, member: Immutable<Person>) {
    this.produceUpdate((draft) => {
      const index = draft.metadata.administrationPresent.findIndex(
        (m) => m.id === id
      );
      draft.metadata.administrationPresent[index] = {
        ...member,
        id: draft.metadata.administrationPresent[index].id,
      };
    });
  }

  setLocation(location: string) {
    this.updateSession({
      ...this._session,
      metadata: { ...this._session.metadata, location },
    });
  }

  addTopic(
    topic: Pick<Immutable<Topic>, "title" | "startTime" | "endTime" | "leader">
  ) {
    this.produceUpdate((draft) => {
      draft.topics.push({
        ...topic,
        id: this.topicId++,
        notes: [],
        leader: topic.leader && this.findPerson(topic.leader),
      });
    });
  }

  removeTopic(id: number) {
    this.produceUpdate((draft) => {
      draft.topics = draft.topics.filter((t) => t.id !== id);
    });
  }

  updateTopic(
    id: number,
    topic: Pick<Immutable<Topic>, "title" | "startTime" | "endTime" | "leader">
  ) {
    this.produceUpdate((draft) => {
      const index = draft.topics.findIndex((t) => t.id === id);
      draft.topics[index] = {
        ...topic,
        id: draft.topics[index].id,
        notes: draft.topics[index].notes,
        leader: topic.leader && this.findPerson(topic.leader),
      };
    });
  }

  addNote(topicId: number, note: Immutable<Note>) {
    this.produceUpdate((draft) => {
      const index = draft.topics.findIndex((t) => t.id === topicId);
      draft.topics[index].notes.push({
        ...note,
        id: this.noteId++,
      });
    });
  }

  removeNote(noteId: number) {
    this.produceUpdate((draft) => {
      draft.topics.forEach((topic) => {
        topic.notes = topic.notes.filter((n) => n.id !== noteId);
      });
    });
  }

  updateNote(noteId: number, note: Immutable<Note>) {
    this.produceUpdate((draft) => {
      draft.topics.forEach((topic) => {
        const index = topic.notes.findIndex((n) => n.id === noteId);
        topic.notes[index] = {
          ...note,
          id: topic.notes[index].id,
        };
      });
    });
  }
}

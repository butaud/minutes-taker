import {
  Person,
  Session,
  SessionMetadata,
  Topic,
  Note,
  ActionItemNote,
  MotionNote,
  TextNote,
} from "minutes-model";
import { produce, Immutable, Draft } from "immer";

type WithId<T> = T & { id: number };

type HaltingTypes =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Function
  | Date;

type AddIdToArrayTypes<T, SpecialIdTypes = never> = {
  [K in keyof T]: T[K] extends Array<infer Item>
    ? Array<WithId<AddIdToArrayTypes<Item, SpecialIdTypes>>>
    : T[K] extends SpecialIdTypes
    ? WithId<T[K]>
    : T[K] extends HaltingTypes
    ? T[K]
    : AddIdToArrayTypes<T[K], SpecialIdTypes>;
};
type StoredSessionBeforeTopicLeaderHack = AddIdToArrayTypes<Session, Person>;
type StoredSessionAfterTopicLeaderHack = Omit<
  StoredSessionBeforeTopicLeaderHack,
  "topics"
> & {
  topics: (Omit<
    StoredSessionBeforeTopicLeaderHack["topics"][number],
    "leader"
  > & {
    leader?: StoredPerson;
  })[];
};
export type StoredSession = Immutable<StoredSessionAfterTopicLeaderHack>;
export type StoredSessionMetadata = StoredSession["metadata"];
export type StoredTopic = StoredSession["topics"][number];
export type StoredPerson = StoredSessionMetadata["membersPresent"][number];
export type StoredNote = StoredTopic["notes"][number];
export type StoredTextNote = WithId<TextNote>;
export type StoredActionItemNote = Omit<WithId<ActionItemNote>, "assignee"> & {
  assignee: StoredPerson;
};
export type StoredMotionNote = Omit<
  WithId<MotionNote>,
  "mover" | "seconder"
> & {
  mover: StoredPerson;
  seconder: StoredPerson;
};

export class SessionStore {
  private _history: StoredSession[] = [];
  private _undoHistory: StoredSession[] = [];
  private _session: StoredSession;
  private callbacks: ((session: StoredSession) => void)[] = [];
  private personId = 0;
  private topicId = 0;
  private noteId = 0;

  constructor(session: Session) {
    this._session = this.convertSession(session);
  }

  private convertSession(session: Session): StoredSession {
    const sessionMetadata = this.convertSessionMetadata(session.metadata);

    // Kind of a hack so that we can access the full list of persons when we are creating
    // the topics.
    this._session = {
      metadata: sessionMetadata,
      topics: [],
    };

    return {
      metadata: sessionMetadata,
      topics: this.convertTopics(session.topics),
    };
  }

  private findPerson(person: Person): StoredPerson {
    const found = this.allPeople.find(
      (p) => p.firstName === person.firstName && p.lastName === person.lastName
    );
    if (!found) {
      throw new Error(
        `Could not find person named ${person.firstName} ${person.lastName}.`
      );
    }
    return found;
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

  private convertTextNote = (note: TextNote): StoredTextNote => {
    return {
      ...note,
      id: this.noteId++,
    };
  };

  private convertActionItemNote = (
    note: ActionItemNote
  ): StoredActionItemNote => {
    return {
      ...note,
      id: this.noteId++,
      assignee: this.findPerson(note.assignee),
    };
  };

  private convertMotionNote = (note: MotionNote): StoredMotionNote => {
    return {
      ...note,
      id: this.noteId++,
      mover: this.findPerson(note.mover),
      seconder: this.findPerson(note.seconder),
    };
  };

  private convertNote = (note: Note): StoredNote => {
    if (note.type === "text") {
      return this.convertTextNote(note);
    } else if (note.type === "actionItem") {
      return this.convertActionItemNote(note);
    } else {
      return this.convertMotionNote(note);
    }
  };

  private convertTopics(topics: Topic[]): StoredTopic[] {
    const noteListConverter = (notes: Note[]) => {
      return notes.map((note) => this.convertNote(note));
    };
    return topics.map((topic) => ({
      ...topic,
      id: this.topicId++,
      notes: noteListConverter(topic.notes),
      leader: topic.leader && this.findPerson(topic.leader),
    }));
  }

  private updateSession(
    session: StoredSession,
    isUndo: boolean = false,
    isRedo: boolean = false
  ) {
    if (isUndo) {
      this._undoHistory.push(this._session);
      this._history.pop();
    } else {
      this._history.push(this._session);
      if (isRedo) {
        this._undoHistory.pop();
      } else {
        this._undoHistory = [];
      }
    }
    this._session = session;
    this.callbacks.forEach((cb) => cb(this._session));
  }

  private produceUpdate(update: (draft: Draft<StoredSession>) => void) {
    this.updateSession(produce(this._session, update));
  }

  private throwIfMemberIsReferenced = (person: StoredPerson) => {
    if (this._session.topics.some((topic) => topic.leader?.id === person.id)) {
      throw new Error(
        "This person is the leader of a topic and cannot be removed."
      );
    }
    if (
      this._session.topics.some((topic) =>
        topic.notes.some(
          (note) =>
            (note.type === "motion" &&
              (note.mover.id === person.id ||
                note.seconder.id === person.id)) ||
            (note.type === "actionItem" && note.assignee.id === person.id)
        )
      )
    ) {
      throw new Error(
        "This person is referenced in a note and cannot be removed."
      );
    }
  };

  get session() {
    return this._session;
  }

  get allPeople(): readonly StoredPerson[] {
    return [
      ...this.session.metadata.membersPresent,
      ...this.session.metadata.membersAbsent,
      ...this.session.metadata.administrationPresent,
    ];
  }

  subscribe = (callback: (session: StoredSession) => void) => {
    this.callbacks.push(callback);
  };

  unsubscribe = (callback: (session: StoredSession) => void) => {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  };

  undo = () => {
    if (this._history.length > 0) {
      this.updateSession(this._history[this._history.length - 1], true);
    }
  };

  redo = () => {
    if (this._undoHistory.length > 0) {
      this.updateSession(
        this._undoHistory[this._undoHistory.length - 1],
        false,
        true
      );
    }
  };

  updateMetadata = (
    metadata: Omit<
      SessionMetadata,
      "membersPresent" | "membersAbsent" | "administrationPresent"
    >
  ) => {
    this.produceUpdate((draft) => {
      draft.metadata = {
        ...draft.metadata,
        ...metadata,
      };
    });
  };

  addMemberPresent = (member: Person) => {
    this.produceUpdate((draft) => {
      draft.metadata.membersPresent.push({ ...member, id: this.personId++ });
    });
  };

  removeMemberPresent = (member: StoredPerson) => {
    this.throwIfMemberIsReferenced(member);
    this.produceUpdate((draft) => {
      draft.metadata.membersPresent = draft.metadata.membersPresent.filter(
        (m) => m.id !== member.id
      );
    });
  };

  updateMemberPresent = (member: StoredPerson) => {
    this.produceUpdate((draft) => {
      const index = draft.metadata.membersPresent.findIndex(
        (m) => m.id === member.id
      );
      draft.metadata.membersPresent[index] = {
        ...member,
        id: draft.metadata.membersPresent[index].id,
      };
    });
  };

  addMemberAbsent = (member: Person) => {
    this.produceUpdate((draft) => {
      draft.metadata.membersAbsent.push({ ...member, id: this.personId++ });
    });
  };

  removeMemberAbsent = (member: StoredPerson) => {
    this.throwIfMemberIsReferenced(member);
    this.produceUpdate((draft) => {
      draft.metadata.membersAbsent = draft.metadata.membersAbsent.filter(
        (m) => m.id !== member.id
      );
    });
  };

  updateMemberAbsent = (member: StoredPerson) => {
    this.produceUpdate((draft) => {
      const index = draft.metadata.membersAbsent.findIndex(
        (m) => m.id === member.id
      );
      draft.metadata.membersAbsent[index] = {
        ...member,
        id: draft.metadata.membersAbsent[index].id,
      };
    });
  };

  addAdministrationPresent = (member: Person) => {
    this.produceUpdate((draft) => {
      draft.metadata.administrationPresent.push({
        ...member,
        id: this.personId++,
      });
    });
  };

  removeAdministrationPresent = (member: StoredPerson) => {
    this.throwIfMemberIsReferenced(member);
    this.produceUpdate((draft) => {
      draft.metadata.administrationPresent =
        draft.metadata.administrationPresent.filter((m) => m.id !== member.id);
    });
  };

  updateAdministrationPresent = (member: StoredPerson) => {
    this.produceUpdate((draft) => {
      const index = draft.metadata.administrationPresent.findIndex(
        (m) => m.id === member.id
      );
      draft.metadata.administrationPresent[index] = {
        ...member,
        id: draft.metadata.administrationPresent[index].id,
      };
    });
  };

  addTopic = (
    topic: Pick<Topic, "title" | "startTime" | "durationMinutes" | "leader">
  ) => {
    this.produceUpdate((draft) => {
      // Update the duration on the previous topic
      if (draft.topics.length > 0) {
        const previousTopic = draft.topics[draft.topics.length - 1];
        previousTopic.durationMinutes = Math.round(
          (topic.startTime.getTime() - previousTopic.startTime.getTime()) /
            60000
        );
      }
      draft.topics.push({
        ...topic,
        id: this.topicId++,
        notes: [],
        leader: topic.leader && this.findPerson(topic.leader),
      });
    });
  };

  removeTopic = (topic: StoredTopic) => {
    this.produceUpdate((draft) => {
      draft.topics = draft.topics.filter((t) => t.id !== topic.id);
    });
  };

  updateTopic = (
    topic: Pick<
      StoredTopic,
      "title" | "startTime" | "durationMinutes" | "leader" | "id"
    >
  ) => {
    this.produceUpdate((draft) => {
      const index = draft.topics.findIndex((t) => t.id === topic.id);
      draft.topics[index] = {
        ...topic,
        id: draft.topics[index].id,
        notes: draft.topics[index].notes,
        leader: topic.leader,
      };
    });
  };

  addNote = (topicId: number, note: Note, beforeIndex?: number) => {
    this.produceUpdate((draft) => {
      const index = draft.topics.findIndex((t) => t.id === topicId);
      const topic = draft.topics[index];
      const storedNote = this.convertNote(note);
      if (beforeIndex !== undefined) {
        topic.notes.splice(beforeIndex, 0, storedNote);
      } else {
        topic.notes.push(storedNote);
      }
    });
  };

  removeNote = (note: StoredNote) => {
    this.produceUpdate((draft) => {
      draft.topics.forEach((topic) => {
        topic.notes = topic.notes.filter((n) => n.id !== note.id);
      });
    });
  };

  updateNote = (note: StoredNote) => {
    this.produceUpdate((draft) => {
      draft.topics.forEach((topic) => {
        const index = topic.notes.findIndex((n) => n.id === note.id);
        if (index !== -1) {
          topic.notes[index] = {
            ...note,
            id: topic.notes[index].id,
          };
        }
      });
    });
  };
}

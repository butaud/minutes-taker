import {
  Person,
  Session,
  SessionMetadata,
  Topic,
  Note,
  ActionItemNote,
  MotionNote,
  TextNote,
  Caller,
  CalendarMonth,
  Calendar,
  CalendarItem,
  Committee,
  DeferredActionItem,
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
type StoredSessionAfterCalendarHack = Omit<
  StoredSessionAfterTopicLeaderHack,
  "calendar"
> & {
  calendar: StoredCalendarMonthEntry[];
};
export type StoredSession = Immutable<StoredSessionAfterCalendarHack>;
export type StoredSessionMetadata = StoredSession["metadata"];
export type StoredCalendar = StoredSession["calendar"];
export type StoredCalendarItem = WithId<CalendarItem>;
export type StoredCalendarMonthEntry = {
  month: CalendarMonth;
  items: StoredCalendarItem[];
};
export type StoredCaller = StoredSessionMetadata["caller"];
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
export type StoredCommittee = StoredSession["committees"][number];
export type StoredDeferredActionItem =
  StoredSession["deferredActionItems"][number];

export class SessionStore {
  private _history: StoredSession[] = [];
  private _undoHistory: StoredSession[] = [];
  private _session: StoredSession;
  private callbacks: ((session: StoredSession) => void)[] = [];
  private personId = 0;
  private topicId = 0;
  private noteId = 0;
  private calendarItemId = 0;
  private committeeId = 0;
  private deferredActionItemId = 0;

  constructor(session: Session) {
    this._session = this.convertSession(session);
  }

  loadSession(session: Session) {
    this._history = [];
    this._undoHistory = [];
    this._session = this.convertSession(session);
    this.callbacks.forEach((callback) => callback(this._session));
  }

  private convertSession(session: Session): StoredSession {
    const attendanceLists = this.convertAttendanceLists(session.metadata);
    // Hack so that we can access the full list of persons when we are converting the rest of the schema.
    this._session = {
      metadata: attendanceLists as any,
      calendar: [],
      topics: [],
      committees: [],
      deferredActionItems: [],
    };

    const metadata = this.convertSessionMetadata(session.metadata);
    const calendar = this.convertSessionCalendar(session.calendar);
    const topics = this.convertTopics(session.topics);
    const committees = this.convertCommittees(session.committees);
    const deferredActionItems = this.convertDeferredActionItems(
      session.deferredActionItems
    );

    return {
      metadata,
      calendar,
      topics,
      committees,
      deferredActionItems,
    };
  }

  private convertAttendanceLists(
    sessionMetadata: SessionMetadata
  ): Pick<
    StoredSessionMetadata,
    "membersPresent" | "membersAbsent" | "administrationPresent"
  > {
    const personListConverter = (people: Person[]) => {
      return people.map((person) => ({
        ...person,
        id: this.personId++,
      }));
    };
    return {
      membersPresent: personListConverter(sessionMetadata.membersPresent),
      membersAbsent: personListConverter(sessionMetadata.membersAbsent),
      administrationPresent: personListConverter(
        sessionMetadata.administrationPresent
      ),
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
    return {
      ...metadata,
      membersPresent: this.session.metadata.membersPresent,
      membersAbsent: this.session.metadata.membersAbsent,
      administrationPresent: this.session.metadata.administrationPresent,
      caller: metadata.caller && {
        ...metadata.caller,
        person: this.findPerson(metadata.caller.person),
      },
    };
  }

  private convertSessionCalendar(calendar: Calendar): StoredCalendar {
    const calendarItemConverter = (items: CalendarItem[]) => {
      return items.map((item) => ({
        ...item,
        id: this.calendarItemId++,
      }));
    };
    return calendar.map((monthEntry) => {
      return {
        month: monthEntry.month,
        items: calendarItemConverter(monthEntry.items),
      };
    });
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

  private convertCommittees(committees: Committee[]): StoredCommittee[] {
    return committees.map((committee) => ({
      ...committee,
      id: this.committeeId++,
    }));
  }

  private convertDeferredActionItems(
    deferredActionItems: DeferredActionItem[]
  ): StoredDeferredActionItem[] {
    return deferredActionItems.map((deferredActionItem) => ({
      ...deferredActionItem,
      id: this.deferredActionItemId++,
      assignee: this.findPerson(deferredActionItem.assignee),
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
      "membersPresent" | "membersAbsent" | "administrationPresent" | "caller"
    >
  ) => {
    this.produceUpdate((draft) => {
      draft.metadata = {
        ...draft.metadata,
        ...metadata,
      };
    });
  };

  updateCaller = (caller: Caller | undefined) => {
    this.produceUpdate((draft) => {
      draft.metadata.caller = caller && {
        ...caller,
        person: this.findPerson(caller.person),
      };
    });
  };

  updateCommitteeDocUrl = (committeeDocUrl: string | undefined) => {
    this.produceUpdate((draft) => {
      draft.metadata.committeeDocUrl = committeeDocUrl;
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

  addCalendarMonth = (month: CalendarMonth, beforeIndex: number) => {
    if (this._session.calendar.some((m) => m.month === month)) {
      throw new Error("This month already exists in the calendar.");
    }
    this.produceUpdate((draft) => {
      draft.calendar.splice(beforeIndex, 0, {
        month,
        items: [],
      });
    });
  };

  removeCalendarMonth = (month: CalendarMonth) => {
    if (!this._session.calendar.some((m) => m.month === month)) {
      throw new Error("This month does not exist in the calendar.");
    }
    this.produceUpdate((draft) => {
      draft.calendar = draft.calendar.filter((m) => m.month !== month);
    });
  };

  addCalendarItem = (month: CalendarMonth, item: CalendarItem) => {
    if (!this._session.calendar.some((m) => m.month === month)) {
      throw new Error("This month does not exist in the calendar.");
    }
    this.produceUpdate((draft) => {
      const index = draft.calendar.findIndex((m) => m.month === month);
      draft.calendar[index].items.push({
        ...item,
        id: this.calendarItemId++,
      });
    });
  };

  updateCalendarItem = (item: StoredCalendarItem) => {
    this.produceUpdate((draft) => {
      draft.calendar.forEach((month) => {
        const existingItem = month.items.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.completed = item.completed;
          existingItem.text = item.text;
        }
      });
    });
  };

  removeCalendarItem = (item: StoredCalendarItem) => {
    this.produceUpdate((draft) => {
      draft.calendar.forEach((month) => {
        month.items = month.items.filter((i) => i.id !== item.id);
      });
    });
  };

  addTopic = (
    topic: Pick<Topic, "title" | "startTime" | "durationMinutes" | "leader">,
    beforeIndex?: number
  ) => {
    this.produceUpdate((draft) => {
      // Update the duration on the previous topic
      if (beforeIndex === undefined && draft.topics.length > 0) {
        const previousTopic = draft.topics[draft.topics.length - 1];
        previousTopic.durationMinutes = Math.round(
          (topic.startTime.getTime() - previousTopic.startTime.getTime()) /
            60000
        );
      }
      const storedTopic = {
        ...topic,
        id: this.topicId++,
        notes: [],
        leader: topic.leader && this.findPerson(topic.leader),
      };

      if (beforeIndex === undefined) {
        draft.topics.push({
          ...topic,
          id: this.topicId++,
          notes: [],
          leader: topic.leader && this.findPerson(topic.leader),
        });
      } else {
        draft.topics.splice(beforeIndex, 0, storedTopic);
      }
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

  addCommittee = (committee: Committee) => {
    this.produceUpdate((draft) => {
      draft.committees.push({
        ...committee,
        id: this.committeeId++,
      });
    });
  };

  removeCommittee = (committee: StoredCommittee) => {
    this.produceUpdate((draft) => {
      draft.committees = draft.committees.filter((c) => c.id !== committee.id);
    });
  };

  updateCommittee = (committee: StoredCommittee) => {
    this.produceUpdate((draft) => {
      const existing = draft.committees.find((c) => c.id === committee.id);
      if (existing) {
        existing.name = committee.name;
        existing.type = committee.type;
      }
    });
  };

  addDeferredActionItem = (item: DeferredActionItem) => {
    this.produceUpdate((draft) => {
      draft.deferredActionItems.push({
        ...item,
        id: this.deferredActionItemId++,
        assignee: this.findPerson(item.assignee),
      });
    });
  };

  removeDeferredActionItem = (item: StoredDeferredActionItem) => {
    this.produceUpdate((draft) => {
      draft.deferredActionItems = draft.deferredActionItems.filter(
        (i) => i.id !== item.id
      );
    });
  };

  updateDeferredActionItem = (item: StoredDeferredActionItem) => {
    this.produceUpdate((draft) => {
      const existing = draft.deferredActionItems.find((i) => i.id === item.id);
      if (existing) {
        existing.text = item.text;
        existing.assignee = item.assignee;
        existing.dueDate = item.dueDate;
        existing.completed = item.completed;
      }
    });
  };

  private exportPerson = (person: StoredPerson): Person => ({
    title: person.title,
    firstName: person.firstName,
    lastName: person.lastName,
  });

  private exportNote = (note: StoredNote): Note => {
    if (note.type === "text") {
      return {
        type: "text",
        text: note.text,
      };
    } else if (note.type === "actionItem") {
      return {
        type: "actionItem",
        text: note.text,
        assignee: this.exportPerson(note.assignee),
        dueDate: note.dueDate,
      };
    } else {
      return {
        type: "motion",
        text: note.text,
        mover: this.exportPerson(note.mover),
        seconder: this.exportPerson(note.seconder),
        outcome: note.outcome,
        inFavorCount: note.inFavorCount,
        opposedCount: note.opposedCount,
        abstainedCount: note.abstainedCount,
      };
    }
  };

  private exportCalendarItem = (item: StoredCalendarItem): CalendarItem => {
    return {
      text: item.text,
      completed: item.completed,
    };
  };

  private exportCalendar = (calendar: StoredCalendar): Calendar => {
    return calendar.map((monthEntry) => ({
      month: monthEntry.month,
      items: monthEntry.items.map(this.exportCalendarItem),
    }));
  };

  private exportTopic = (topic: StoredTopic): Topic => ({
    title: topic.title,
    startTime: topic.startTime,
    durationMinutes: topic.durationMinutes,
    leader: topic.leader && this.exportPerson(topic.leader),
    notes: topic.notes.map(this.exportNote),
  });

  private exportCommittee = (committee: StoredCommittee): Committee => ({
    name: committee.name,
    type: committee.type,
  });

  private exportDeferredActionItem = (
    deferredActionItem: StoredDeferredActionItem
  ): DeferredActionItem => ({
    text: deferredActionItem.text,
    assignee: this.exportPerson(deferredActionItem.assignee),
    dueDate: deferredActionItem.dueDate,
    completed: deferredActionItem.completed,
  });

  export = (): Session => {
    const metadata = this._session.metadata;
    const topics = this._session.topics;
    const committees = this._session.committees;
    const deferredActionItems = this._session.deferredActionItems;
    return {
      metadata: {
        ...metadata,
        membersPresent: metadata.membersPresent.map(this.exportPerson),
        membersAbsent: metadata.membersAbsent.map(this.exportPerson),
        administrationPresent: metadata.administrationPresent.map(
          this.exportPerson
        ),
      },
      calendar: this.exportCalendar(this._session.calendar),
      topics: topics.map(this.exportTopic),
      committees: committees.map(this.exportCommittee),
      deferredActionItems: deferredActionItems.map(
        this.exportDeferredActionItem
      ),
    };
  };
}

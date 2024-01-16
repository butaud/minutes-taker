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
  PastActionItem,
  LinkNote,
} from "minutes-model";
import { produce, Draft } from "immer";
import { ISessionDb } from "./ISessionDb";
import {
  StoredActionItemNote,
  StoredCalendar,
  StoredCalendarItem,
  StoredCommittee,
  StoredMotionNote,
  StoredNote,
  StoredPastActionItem,
  StoredPerson,
  StoredSession,
  StoredSessionMetadata,
  StoredTextNote,
  StoredTopic,
} from "./types";
import { LocalStorageSessionDb } from "./LocalStorageSessionDb";
import { isActionItemNote, isMotionNote, isTextNote } from "../util/types";

type AttendanceLists = Pick<
  StoredSessionMetadata,
  "membersPresent" | "membersAbsent" | "administrationPresent"
>;

export class SessionStore {
  private callbacks: ((session: StoredSession) => void)[] = [];
  private db: ISessionDb;

  constructor() {
    this.db = new LocalStorageSessionDb();
  }

  loadSession(session: Session) {
    this.db.history = [];
    this.db.undoHistory = [];
    this.db.currentSession = this.convertSession(session);
    this.callbacks.forEach((callback) => callback(this.db.currentSession));
  }

  private convertSession(session: Session): StoredSession {
    const attendanceLists = this.convertAttendanceLists(session.metadata);

    const metadata = this.convertSessionMetadata(
      session.metadata,
      attendanceLists
    );
    const calendar = this.convertSessionCalendar(session.calendar);
    const topics = this.convertTopics(session.topics, attendanceLists);
    const committees = this.convertCommittees(session.committees);
    const pastActionItems = this.convertPastActionItems(
      session.pastActionItems,
      attendanceLists
    );

    return {
      metadata,
      calendar,
      topics,
      committees,
      pastActionItems,
    };
  }

  private convertAttendanceLists(
    sessionMetadata: SessionMetadata
  ): AttendanceLists {
    const personListConverter = (people: Person[]) => {
      return people.map((person) => ({
        ...person,
        id: this.db.personId++,
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

  private findPerson(
    person: Person,
    attendanceLists?: AttendanceLists
  ): StoredPerson {
    const allPeople = attendanceLists
      ? [
          ...attendanceLists.membersPresent,
          ...attendanceLists.membersAbsent,
          ...attendanceLists.administrationPresent,
        ]
      : this.allPeople;
    const found = allPeople.find(
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
    metadata: SessionMetadata,
    attendanceLists: AttendanceLists
  ): StoredSessionMetadata {
    return {
      ...metadata,
      ...attendanceLists,
      caller: metadata.caller && {
        ...metadata.caller,
        person: this.findPerson(metadata.caller.person, attendanceLists),
      },
    };
  }

  private convertSessionCalendar(calendar: Calendar): StoredCalendar {
    const calendarItemConverter = (items: CalendarItem[]) => {
      return items.map((item) => ({
        ...item,
        id: this.db.calendarItemId++,
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
      id: this.db.noteId++,
    };
  };

  private convertActionItemNote = (
    note: ActionItemNote,
    attendanceLists?: AttendanceLists
  ): StoredActionItemNote => {
    return {
      ...note,
      id: this.db.noteId++,
      assignee: this.findPerson(note.assignee, attendanceLists),
    };
  };

  private convertMotionNote = (
    note: MotionNote,
    attendanceLists?: AttendanceLists
  ): StoredMotionNote => {
    return {
      ...note,
      id: this.db.noteId++,
      mover: this.findPerson(note.mover, attendanceLists),
      seconder: this.findPerson(note.seconder, attendanceLists),
    };
  };

  private convertLinkNote = (note: LinkNote) => ({
    ...note,
    id: this.db.noteId++,
  });

  private convertNote = (
    note: Note,
    attendanceLists?: AttendanceLists
  ): StoredNote => {
    if (isTextNote(note)) {
      return this.convertTextNote(note);
    } else if (isActionItemNote(note)) {
      return this.convertActionItemNote(note, attendanceLists);
    } else if (isMotionNote(note)) {
      return this.convertMotionNote(note, attendanceLists);
    } else {
      return this.convertLinkNote(note);
    }
  };

  private convertTopics(
    topics: Topic[],
    attendanceLists: AttendanceLists
  ): StoredTopic[] {
    const noteListConverter = (notes: Note[]) => {
      return notes.map((note) => this.convertNote(note, attendanceLists));
    };
    return topics.map((topic) => ({
      ...topic,
      id: this.db.topicId++,
      notes: noteListConverter(topic.notes),
      leader: topic.leader && this.findPerson(topic.leader, attendanceLists),
    }));
  }

  private convertCommittees(committees: Committee[]): StoredCommittee[] {
    return committees.map((committee) => ({
      ...committee,
      id: this.db.committeeId++,
    }));
  }

  private convertPastActionItems(
    pastActionItems: PastActionItem[],
    attendanceLists: AttendanceLists
  ): StoredPastActionItem[] {
    return pastActionItems.map((pastActionItem) => ({
      ...pastActionItem,
      id: this.db.pastActionItemId++,
      assignee: this.findPerson(pastActionItem.assignee, attendanceLists),
    }));
  }

  private updateSession(
    session: StoredSession,
    isUndo = false,
    isRedo = false
  ) {
    if (isUndo) {
      this.db.pushUndoHistory(this.db.currentSession);
      this.db.popHistory();
    } else {
      this.db.pushHistory(this.db.currentSession);
      if (isRedo) {
        this.db.popUndoHistory();
      } else {
        this.db.undoHistory = [];
      }
    }
    this.db.currentSession = session;
    this.callbacks.forEach((cb) => cb(this.db.currentSession));
  }

  private produceUpdate(update: (draft: Draft<StoredSession>) => void) {
    this.updateSession(produce(this.db.currentSession, update));
  }

  private throwIfMemberIsReferenced = (person: StoredPerson) => {
    if (
      this.db.currentSession.topics.some(
        (topic) => topic.leader?.id === person.id
      )
    ) {
      throw new Error(
        "This person is the leader of a topic and cannot be removed."
      );
    }
    if (
      this.db.currentSession.topics.some((topic) =>
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
    return this.db.currentSession;
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
    if (this.db.history.length > 0) {
      this.updateSession(this.db.history[this.db.history.length - 1], true);
    }
  };

  redo = () => {
    if (this.db.undoHistory.length > 0) {
      this.updateSession(
        this.db.undoHistory[this.db.undoHistory.length - 1],
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
      draft.metadata.membersPresent.push({ ...member, id: this.db.personId++ });
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
      draft.metadata.membersAbsent.push({ ...member, id: this.db.personId++ });
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
        id: this.db.personId++,
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
    if (this.db.currentSession.calendar.some((m) => m.month === month)) {
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
    if (!this.db.currentSession.calendar.some((m) => m.month === month)) {
      throw new Error("This month does not exist in the calendar.");
    }
    this.produceUpdate((draft) => {
      draft.calendar = draft.calendar.filter((m) => m.month !== month);
    });
  };

  addCalendarItem = (month: CalendarMonth, item: CalendarItem) => {
    if (!this.db.currentSession.calendar.some((m) => m.month === month)) {
      throw new Error("This month does not exist in the calendar.");
    }
    this.produceUpdate((draft) => {
      const index = draft.calendar.findIndex((m) => m.month === month);
      draft.calendar[index].items.push({
        ...item,
        id: this.db.calendarItemId++,
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
      const storedTopic = {
        ...topic,
        id: this.db.topicId++,
        notes: [],
        leader: topic.leader && this.findPerson(topic.leader),
      };

      if (beforeIndex === undefined) {
        draft.topics.push({
          ...topic,
          id: this.db.topicId++,
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

  sortTopics = () => {
    this.produceUpdate((draft) => {
      draft.topics.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
    });
  };

  getLastTopicEndTime = (beforeIndex?: number) => {
    const lastTopic =
      beforeIndex !== undefined
        ? this.db.currentSession.topics[beforeIndex - 1]
        : this.db.currentSession.topics[
            this.db.currentSession.topics.length - 1
          ];
    if (lastTopic) {
      const lastTopicDuration = lastTopic.durationMinutes ?? 0;
      return new Date(
        lastTopic.startTime.getTime() + lastTopicDuration * 60 * 1000
      );
    } else {
      return undefined;
    }
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
        id: this.db.committeeId++,
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

  addPastActionItem = (item: PastActionItem) => {
    this.produceUpdate((draft) => {
      draft.pastActionItems.push({
        ...item,
        id: this.db.pastActionItemId++,
        assignee: this.findPerson(item.assignee),
      });
    });
  };

  removePastActionItem = (item: StoredPastActionItem) => {
    this.produceUpdate((draft) => {
      draft.pastActionItems = draft.pastActionItems.filter(
        (i) => i.id !== item.id
      );
    });
  };

  updatePastActionItem = (item: StoredPastActionItem) => {
    this.produceUpdate((draft) => {
      const existing = draft.pastActionItems.find((i) => i.id === item.id);
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
    } else if (note.type === "motion") {
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
    } else {
      return {
        type: "link",
        text: note.text,
        url: note.url,
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

  private exportPastActionItem = (
    pastActionItem: StoredPastActionItem
  ): PastActionItem => ({
    text: pastActionItem.text,
    assignee: this.exportPerson(pastActionItem.assignee),
    dueDate: pastActionItem.dueDate,
    completed: pastActionItem.completed,
  });

  export = (): Session => {
    const metadata = this.db.currentSession.metadata;
    const topics = this.db.currentSession.topics;
    const committees = this.db.currentSession.committees;
    const pastActionItems = this.db.currentSession.pastActionItems;
    return {
      metadata: {
        ...metadata,
        membersPresent: metadata.membersPresent.map(this.exportPerson),
        membersAbsent: metadata.membersAbsent.map(this.exportPerson),
        administrationPresent: metadata.administrationPresent.map(
          this.exportPerson
        ),
      },
      calendar: this.exportCalendar(this.db.currentSession.calendar),
      topics: topics.map(this.exportTopic),
      committees: committees.map(this.exportCommittee),
      pastActionItems: pastActionItems.map(this.exportPastActionItem),
    };
  };
}

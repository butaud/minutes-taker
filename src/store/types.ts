import { Immutable } from "immer";
import {
  ActionItemNote,
  CalendarItem,
  CalendarMonth,
  LinkNote,
  MotionNote,
  Person,
  Session,
  TextNote,
} from "minutes-model";

type WithId<T> = T & { id: number };

type HaltingTypes =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  // eslint-disable-next-line @typescript-eslint/ban-types
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
export type StoredLinkNote = WithId<LinkNote>;
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
export type StoredPastActionItem = StoredSession["pastActionItems"][number];

export const emptySession: StoredSession = {
  metadata: {
    startTime: new Date(),
    membersPresent: [],
    membersAbsent: [],
    administrationPresent: [],
    location: "",
    organization: "",
    subtitle: "",
    title: "",
  },
  calendar: [],
  topics: [],
  committees: [],
  pastActionItems: [],
};

export type Session = {
  metadata: SessionMetadata;
  calendar: Calendar;
  topics: Topic[];
  committees: Committee[];
};

export type SessionMetadata = {
  membersPresent: Person[];
  membersAbsent: Person[];
  administrationPresent: Person[];
  location: string;
  startTime: Date;
  organization: string;
  title: string;
  subtitle: string;
  caller?: Caller;
  committeeDocUrl?: string;
};

export type CommitteeType = "Board" | "Headmaster";

export type Committee = {
  name: string;
  type: CommitteeType;
};

export type CalendarMonth =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export type Calendar = CalendarMonthEntry[];

export type CalendarMonthEntry = {
  month: CalendarMonth;
  items: CalendarItem[];
};

export type CalendarItem = {
  text: string;
  completed: boolean;
};

export type PersonTitle = "Mr." | "Mrs." | "Miss";

export type Person = {
  title: PersonTitle;
  firstName: string;
  lastName: string;
};

export type Caller = {
  person: Person;
  role: string;
};

export type Topic = {
  title: string;
  notes: Note[];
  startTime: Date;
  durationMinutes?: number;
  leader?: Person;
};

export type Note = TextNote | ActionItemNote | MotionNote;

export type TextNote = {
  type: "text";
  text: string;
};

export type ActionItemNote = {
  type: "actionItem";
  text: string;
  assignee: Person;
  dueDate: Date;
};

export type MotionNote = {
  type: "motion";
  text: string;
  mover: Person;
  seconder: Person;
  inFavorCount?: number;
  opposedCount?: number;
  abstainedCount?: number;
  outcome: "passed" | "failed" | "tabled" | "withdrawn" | "active";
};

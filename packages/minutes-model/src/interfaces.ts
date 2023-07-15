export type Session = {
  metadata: SessionMetadata;
  topics: Topic[];
};

export type SessionMetadata = {
  membersPresent: Person[];
  membersAbsent: Person[];
  administrationPresent: Person[];
  location: string;
  startTime: Date;
  organization: string;
  title: string;
};

export type Person = {
  firstName: string;
  lastName: string;
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

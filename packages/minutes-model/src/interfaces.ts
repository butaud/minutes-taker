export type Session = {
    metadata: SessionMetadata;
    topics: Topic[];
}

export type SessionMetadata = {
    membersPresent: Person[];
    membersAbsent: Person[];
    administrationPresent: Person[];
    location: string;
    startTime: Date;
};

export type Person = {
    firstName: string;
    lastName: string;
};

export type Topic = {
    title: string;
    notes: Note[];
};

export type Note = TextNote | ActionItemNote | MotionNote;

export type TextNote = {
    text: string;
    speaker?: Person;
}

export type ActionItemNote = {
    text: string;
    assignee: Person;
    dueDate: Date;
}

export type MotionNote = {
    text: string;
    mover: Person;
    seconder: Person;
    voteCount: number;
};
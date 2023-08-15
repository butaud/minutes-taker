import { Person, Session } from "minutes-model";

const boardMember1: Person = {
  title: "Mr.",
  firstName: "Joe",
  lastName: "Smith",
};

const boardMember2: Person = {
  title: "Mr.",
  firstName: "Tom",
  lastName: "Jones",
};

const boardMember3: Person = {
  title: "Mr.",
  firstName: "Sam",
  lastName: "Adams",
};

const headmaster: Person = {
  title: "Mr.",
  firstName: "Bob",
  lastName: "Baker",
};

export const fakeSession: Session = {
  metadata: {
    startTime: new Date(),
    administrationPresent: [headmaster],
    membersPresent: [boardMember1, boardMember2],
    membersAbsent: [boardMember3],
    location: "School Boardroom",
    organization: "School School",
    title: "Board Meeting",
    subtitle: "Executive Session",
    committeeDocUrl: "https://www.google.com",
  },
  calendar: [
    {
      month: "June",
      items: [
        {
          text: "Attend Graduation Ceremony",
          completed: true,
        },
        {
          text: "Review Annual Performance",
          completed: false,
        },
      ],
    },
    {
      month: "July",
      items: [
        {
          text: "Plan Board Retreat",
          completed: false,
        },
      ],
    },
  ],
  topics: [
    {
      title: "Call to Order",
      startTime: new Date(),
      durationMinutes: 5,
      notes: [
        {
          type: "text",
          text: "The meeting was called to order at 7:00pm.",
        },
      ],
    },
    {
      title: "Approval of Minutes",
      leader: boardMember2,
      startTime: new Date(),
      durationMinutes: 5,
      notes: [
        {
          type: "motion",
          mover: boardMember1,
          seconder: boardMember2,
          text: "to approve the minutes from the last meeting.",
          outcome: "passed",
          inFavorCount: 2,
          opposedCount: 0,
          abstainedCount: 1,
        },
      ],
    },
    {
      title: "Headmaster's Report",
      startTime: new Date(),
      durationMinutes: 5,
      leader: headmaster,
      notes: [
        {
          type: "text",
          text: "The headmaster gave his report.",
        },
        {
          type: "actionItem",
          assignee: boardMember1,
          text: "follow up with the headmaster about the report",
          dueDate: new Date(),
        },
      ],
    },
  ],
  committees: [
    {
      name: "Facility",
      type: "Board",
    },
    {
      name: "Finance",
      type: "Headmaster",
    },
  ],
  pastActionItems: [
    {
      text: "clean up the board calendar",
      assignee: boardMember1,
      dueDate: new Date(),
      completed: true,
    },
    {
      text: "create a committee report",
      assignee: boardMember1,
      dueDate: new Date(),
      completed: false,
    },
  ],
};

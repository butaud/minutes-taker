import "./App.css";
import { Person, Session } from "minute-model";
import { SessionEditor } from "./ui/SessionEditor";
import { useEffect, useState } from "react";
import { SessionStore, StoredSession } from "./store/SessionStore";
import { SessionProvider } from "./store/SessionStoreContext";

const boardMember1: Person = {
  firstName: "Joe",
  lastName: "Smith",
};

const boardMember2: Person = {
  firstName: "Tom",
  lastName: "Jones",
};

const boardMember3: Person = {
  firstName: "Sam",
  lastName: "Adams",
};

const headmaster: Person = {
  firstName: "Bob",
  lastName: "Baker",
};

const fakeSession: Session = {
  metadata: {
    startTime: new Date(),
    administrationPresent: [headmaster],
    membersPresent: [boardMember1, boardMember2],
    membersAbsent: [boardMember3],
    location: "School Boardroom",
  },
  topics: [
    {
      title: "Call to Order",
      startTime: new Date(),
      endTime: new Date(),
      notes: [
        {
          type: "text",
          speaker: boardMember1,
          text: "The meeting was called to order at 7:00pm.",
        },
      ],
    },
    {
      title: "Approval of Minutes",
      leader: boardMember2,
      startTime: new Date(),
      endTime: new Date(),
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
      endTime: new Date(),
      leader: headmaster,
      notes: [
        {
          type: "text",
          speaker: headmaster,
          text: "The headmaster gave his report.",
        },
        {
          type: "actionItem",
          assignee: boardMember1,
          text: "to follow up with the headmaster about the report",
          dueDate: new Date(),
        },
      ],
    },
  ],
};
const store = new SessionStore(fakeSession);
function App() {
  const [session, setSession] = useState<StoredSession | undefined>(undefined);
  useEffect(() => {
    setSession(store.session);
    return store.subscribe(setSession);
  }, [fakeSession]);
  if (session === undefined) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <SessionProvider sessionStore={store}>
        <SessionEditor session={session} />
      </SessionProvider>
    </>
  );
}

export default App;

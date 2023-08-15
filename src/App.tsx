import "./App.css";
import { SessionEditor } from "./ui/SessionEditor";
import { useEffect, useState } from "react";
import { SessionStore } from "./store/SessionStore";
import { SessionProvider } from "./ui/context/SessionStoreContext";
import { PersonListContext } from "./ui/context/PersonListContext";
import { StoredPerson, StoredSession } from "./store/types";

const store = new SessionStore();

// make this available in JS console for HAX
declare global {
  var __sessionStore: SessionStore;
}
globalThis.__sessionStore = store;

function App() {
  const [session, setSession] = useState<StoredSession | undefined>(undefined);
  const [personList, setPersonList] = useState<readonly StoredPerson[]>([]);
  useEffect(() => {
    setSession(store.session);
    setPersonList(store.allPeople);
    return store.subscribe(() => {
      setSession(store.session);
      setPersonList(store.allPeople);
    });
  }, []);
  if (session === undefined) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <SessionProvider sessionStore={store}>
        <PersonListContext.Provider value={personList}>
          <SessionEditor session={session} />
        </PersonListContext.Provider>
      </SessionProvider>
    </>
  );
}

export default App;

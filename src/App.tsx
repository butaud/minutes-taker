import "./App.css";
import { SessionEditor } from "./ui/SessionEditor";
import { FC, useEffect, useState } from "react";
import { SessionStore } from "./store/SessionStore";
import { SessionProvider } from "./ui/context/SessionStoreContext";
import { PersonListContext } from "./ui/context/PersonListContext";
import { StoredPerson, StoredSession } from "./store/types";

export type AppProps = {
  store: SessionStore;
};
export const App: FC<AppProps> = ({ store }) => {
  const [session, setSession] = useState<StoredSession | undefined>(undefined);
  const [personList, setPersonList] = useState<readonly StoredPerson[]>([]);
  useEffect(() => {
    setSession(store.session);
    setPersonList(store.allPeople);
    return store.subscribe(() => {
      setSession(store.session);
      setPersonList(store.allPeople);
    });
  }, [store]);
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
};

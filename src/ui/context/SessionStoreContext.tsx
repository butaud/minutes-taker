import React, { createContext, useContext } from "react";
import { SessionStore } from "../../store/SessionStore";

type SessionContextType = {
  sessionStore: SessionStore;
};

const SessionContext = createContext<SessionContextType>({
  sessionStore: new SessionStore({
    metadata: {
      membersPresent: [],
      membersAbsent: [],
      administrationPresent: [],
      location: "",
      startTime: new Date(),
      title: "",
      subtitle: "",
      organization: "",
    },
    calendar: [],
    topics: [],
    committees: [],
  }),
});

export const useSessionStore = () => useContext(SessionContext).sessionStore;

type SessionProviderProps = {
  children: React.ReactNode;
  sessionStore: SessionStore;
};

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  sessionStore,
}) => {
  return (
    <SessionContext.Provider value={{ sessionStore }}>
      {children}
    </SessionContext.Provider>
  );
};

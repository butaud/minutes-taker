/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from "react";
import { SessionStore } from "../../store/SessionStore";

type SessionContextType = {
  sessionStore: SessionStore;
};

const SessionContext = createContext<SessionContextType>({
  sessionStore: new SessionStore(),
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

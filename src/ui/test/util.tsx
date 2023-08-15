import { Session } from "minutes-model";
import { SessionStore } from "../../store/SessionStore";
import { ReactElement } from "react";
import { SessionProvider } from "../context/SessionStoreContext";
import { PersonListContext } from "../context/PersonListContext";
import { render as origRender, RenderOptions } from "@testing-library/react";

export const makeEmptySession: () => Session = () => ({
  metadata: {
    organization: " ",
    title: " ",
    subtitle: " ",
    location: " ",
    startTime: new Date(),
    membersPresent: [],
    membersAbsent: [],
    administrationPresent: [],
  },
  calendar: [],
  topics: [],
  committees: [],
  pastActionItems: [],
});

const renderContext = {
  sessionStore: new SessionStore(),
};

const AllProviders = ({ children }: { children: ReactElement }) => (
  <SessionProvider sessionStore={renderContext.sessionStore}>
    <PersonListContext.Provider value={renderContext.sessionStore.allPeople}>
      {children}
    </PersonListContext.Provider>
  </SessionProvider>
);

export const render = (ui: ReactElement, options?: RenderOptions) =>
  origRender(ui, { wrapper: AllProviders, ...options });

export const resetSessionStore = (overrides?: Partial<Session>) => {
  const newStore = new SessionStore();
  newStore.loadSession({ ...makeEmptySession(), ...overrides });
  renderContext.sessionStore = newStore;
  return newStore;
};

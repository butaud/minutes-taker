/* eslint-disable react-refresh/only-export-components */
import { Session } from "minutes-model";
import { SessionStore } from "../../store/SessionStore";
import { ReactElement } from "react";
import { SessionProvider } from "../context/SessionStoreContext";
import { PersonListContext } from "../context/PersonListContext";
import {
  render as origRender,
  RenderOptions,
  screen,
} from "@testing-library/react";

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
    othersReferenced: [],
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

export const findListItemByTextContent = (textContent: string) => {
  const allListItems = screen.getAllByRole("listitem");
  return allListItems.find((listitem) => listitem.textContent === textContent);
};

export const getListItemByTextContent = (textContent: string) => {
  const allListItems = screen.getAllByRole("listitem");
  const found = allListItems.find(
    (listitem) => listitem.textContent === textContent
  );
  if (found === undefined) {
    screen.debug();
    const allText = allListItems
      .map((listitem) => listitem.textContent)
      .join("\n");
    throw new Error(
      `Could not find list item with text content "${textContent}". Found these items:\n${allText}`
    );
  }
  return found;
};

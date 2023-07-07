import { createContext, useContext } from "react";
import { StoredPerson } from "../../store/SessionStore";

export const PersonListContext = createContext<readonly StoredPerson[]>([]);

export const usePersonList = () => {
  return useContext(PersonListContext);
};

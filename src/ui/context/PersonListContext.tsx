/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { StoredPerson } from "../../store/types";

export const PersonListContext = createContext<readonly StoredPerson[]>([]);

export const usePersonList = () => {
  return useContext(PersonListContext);
};

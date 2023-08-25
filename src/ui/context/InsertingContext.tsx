/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

export const InsertingContext = createContext<boolean>(false);

export const useInserting = () => {
  return useContext(InsertingContext);
};

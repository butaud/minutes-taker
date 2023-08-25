/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

export const EditingContext = createContext<boolean>(false);

export const useEditing = () => {
  return useContext(EditingContext);
};

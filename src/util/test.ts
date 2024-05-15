import { act } from "@testing-library/react";

export const allowPropagation = async () => {
  await act(async () => await new Promise((resolve) => setTimeout(resolve, 1)));
};

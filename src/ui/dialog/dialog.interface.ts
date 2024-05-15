import { FunctionComponent } from "react";

export type Dialog<Result> = FunctionComponent<{
  complete: (result: Result) => void;
  reject: (error: Error) => void;
}>;

export class CancelledError extends Error {
  constructor() {
    super("Cancelled");
  }
}

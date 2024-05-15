import { FunctionComponent } from "react";

export type Dialog<Input, Result> = FunctionComponent<
  Input & {
    complete: (result: Result) => void;
    reject: (error: Error) => void;
  }
>;

export class CancelledError extends Error {
  constructor() {
    super("Cancelled");
  }
}

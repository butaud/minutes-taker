/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Assertion, AsymmetricMatchersContaining } from "vitest";

interface CustomMatchers<R = unknown> {
  toPrecede(expected: HTMLElement): R;
}

declare module "vitest" {
  interface Assertion extends CustomMatchers<Assertion> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

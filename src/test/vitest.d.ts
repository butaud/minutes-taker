import type { Assertion, AsymmetricMatchersContaining } from "vitest";

interface CustomMatchers<R = unknown> {
  toPrecede(expected: HTMLElement): R;
}

declare module "vitest" {
  interface Assertion extends CustomMatchers<Assertion> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

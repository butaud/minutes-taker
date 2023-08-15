import "@testing-library/jest-dom";

expect.extend({
  toPrecede(received: HTMLElement, expected: HTMLElement) {
    const comparison = received.compareDocumentPosition(expected);
    const pass = !!(comparison & Node.DOCUMENT_POSITION_FOLLOWING);
    return {
      pass,
      message: () =>
        this.isNot
          ? `expected ${received.outerHTML} not to precede ${expected.outerHTML}`
          : `expected ${received.outerHTML} to precede ${expected.outerHTML}`,
    };
  },
});

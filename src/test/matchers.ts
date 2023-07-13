import { MatcherFunction } from "@testing-library/react";

export const getByTextContent: (searchText: string) => MatcherFunction = (
  searchText
) => {
  return (_content, node) => {
    if (node === null) {
      return false;
    }
    const hasText = (node: Element) => node.textContent === searchText;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
      (child) => !hasText(child as Element)
    );
    return nodeHasText && childrenDontHaveText;
  };
};

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

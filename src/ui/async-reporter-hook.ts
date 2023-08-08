import { useCallback, useState } from "react";

export type AsyncReport = {
  type: "error" | "info";
  message: string;
};

export type AsyncOperation = {
  perform: () => Promise<void>;
  successMessage: string;
  failureMessage: string;
};

export const useAsyncReporter = () => {
  const [report, setReport] = useState<AsyncReport | null>(null);

  const tryAsyncOperation = useCallback((operation: AsyncOperation) => {
    setReport(null);
    operation
      .perform()
      .then(() => {
        setReport({ type: "info", message: operation.successMessage });
        setTimeout(() => setReport(null), 5000);
      })
      .catch(() =>
        setReport({ type: "error", message: operation.failureMessage })
      );
  }, []);

  return { report, tryAsyncOperation };
};

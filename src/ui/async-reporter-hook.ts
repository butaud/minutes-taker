import { useCallback, useState } from "react";

export type AsyncReport = {
  type: "error" | "info";
  message: string;
};

export type AsyncOperation = {
  perform: () => Promise<string | undefined> | Promise<void>;
  successMessage: string;
  failureMessage: string;
};

export const useAsyncReporter = () => {
  const [report, setReport] = useState<AsyncReport | null>(null);

  const tryAsyncOperation = useCallback((operation: AsyncOperation) => {
    setReport(null);
    operation
      .perform()
      .then((result) => {
        setReport({
          type: "info",
          message: result ?? operation.successMessage,
        });
        setTimeout(() => setReport(null), 5000);
      })
      .catch((e) => {
        setReport({ type: "error", message: operation.failureMessage });
        console.error(e);
      });
  }, []);

  return { report, tryAsyncOperation };
};

import { createElement } from "react";
import { Dialog } from "./dialog.interface";
import { createRoot } from "react-dom/client";

export const getDialogResult = async <Input, Result>(
  dialogElement: Dialog<Input, Result>,
  input: Input
): Promise<Result> => {
  if (document.getElementById("modal")) {
    throw new Error("Modal already exists");
  }
  const modalDiv = document.createElement("div");
  modalDiv.id = "modal";
  document.body.appendChild(modalDiv);
  const dialogRoot = createRoot(modalDiv);
  return new Promise<Result>((resolve, reject) => {
    const onComplete = (result: Result) => {
      resolve(result);
      dialogRoot.unmount();
      modalDiv.remove();
    };
    const onReject = (error: Error) => {
      reject(error);
      dialogRoot.unmount();
      modalDiv.remove();
    };
    dialogRoot.render(
      createElement(dialogElement, {
        ...input,
        complete: onComplete,
        reject: onReject,
      })
    );
  });
};

export const __clearDialogs = () => {
  document.getElementById("modal")?.remove();
};

import { createElement } from "react";
import { Dialog } from "./dialog.interface";
import { createRoot } from "react-dom/client";

export const getDialogResult = async <
  Result,
  DialogType extends Dialog<Result>,
>(
  dialogElement: DialogType
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
      createElement(dialogElement, { complete: onComplete, reject: onReject })
    );
  });
};

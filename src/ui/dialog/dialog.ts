import { createElement } from "react";
import ReactDOM from "react-dom";
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
  return new Promise<Result>((resolve, reject) => {
    const onComplete = (result: Result) => {
      resolve(result);
      ReactDOM.unmountComponentAtNode(modalDiv as Element);
      modalDiv.remove();
    };
    const onReject = () => {
      reject();
      ReactDOM.unmountComponentAtNode(modalDiv as Element);
      modalDiv.remove();
    };
    createRoot(modalDiv).render(
      createElement(dialogElement, { complete: onComplete, reject: onReject })
    );
  });
};

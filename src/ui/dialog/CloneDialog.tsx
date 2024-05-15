import { useState } from "react";
import { CancelledError, Dialog } from "./dialog.interface";

import "./CloneDialog.css";

export type CloneDialogResult = {
  startTime: Date;
};
export const CloneDialog: Dialog<CloneDialogResult> = ({
  complete,
  reject,
}) => {
  const [startTime, setStartTime] = useState(new Date());

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const timestamp = Date.parse(event.target.value + "Z");
    if (!isNaN(timestamp)) {
      const startTime = new Date(timestamp);
      setStartTime(startTime);
    }
  };

  return (
    <div className="clone-dialog">
      <h2>Create follow-up session</h2>
      <a className="cancel" onClick={() => reject(new CancelledError())}>
        X
      </a>
      <div className="content">
        <div className="form-line">
          <p>Start time:</p>
          <input
            type="datetime-local"
            aria-label="Start time"
            value={startTime.toISOString().slice(0, -8) ?? ""}
            onChange={handleStartTimeChange}
          />
        </div>
        <button onClick={() => complete({ startTime })}>Create</button>
      </div>
    </div>
  );
};

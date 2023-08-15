import { FC } from "react";
import { StoredActionItemNote } from "../../../store/SessionStore";
import { SpeakerReference } from "../../controls/SpeakerReference";

export const SessionActionItemNode: FC<{
  actionItem: StoredActionItemNote;
}> = ({ actionItem }) => {
  return (
    <li>
      <SpeakerReference speaker={actionItem.assignee} emphasis /> to{" "}
      {actionItem.text}{" "}
      {actionItem.dueDate &&
        "by " +
          actionItem.dueDate.toLocaleDateString("en-US", {
            dateStyle: "short",
            timeZone: "UTC",
          })}
      .
    </li>
  );
};

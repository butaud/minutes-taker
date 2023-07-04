import { ActionItemNote } from "minute-model";
import { SpeakerReference } from "./SpeakerReference";

export const ActionItemNoteNode: React.FC<{ note: ActionItemNote }> = ({
  note,
}) => {
  return (
    <div>
      <em>Action item:</em>{" "}
      <SpeakerReference speaker={note.assignee} emphasis /> to {note.text}{" "}
      {note.dueDate && "by " + note.dueDate.toLocaleDateString()}.
    </div>
  );
};

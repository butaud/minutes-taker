import { TextNote } from "minute-model";
import { SpeakerReference } from "./SpeakerReference";

export const TextNoteNode: React.FC<{ note: TextNote }> = ({ note }) => {
  return (
    <div>
      <p>
        {note.speaker && <SpeakerReference speaker={note.speaker} />}
        {note.speaker && ":"} {note.text}
      </p>
    </div>
  );
};

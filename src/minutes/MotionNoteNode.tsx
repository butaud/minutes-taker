import { MotionNote } from "minute-model";
import { SpeakerReference } from "./SpeakerReference";
import "./MotionNoteNode.css";

export const MotionNoteNode: React.FC<{ note: MotionNote }> = ({ note }) => {
  return (
    <div className="motion">
      <p>
        <SpeakerReference speaker={note.mover} emphasis /> moved to {note.text}.
      </p>
      <p>
        <SpeakerReference speaker={note.seconder} emphasis /> seconded.
      </p>
      <MotionOutcomeDisplay note={note} />
    </div>
  );
};

const MotionOutcomeDisplay: React.FC<{ note: MotionNote }> = ({ note }) => {
  if (note.outcome === "withdrawn") {
    return <p>The motion was abandoned.</p>;
  } else if (note.outcome === "tabled") {
    return <p>The motion was tabled.</p>;
  } else {
    const voteTallies = [];
    if (note.inFavorCount) {
      voteTallies.push(`${note.inFavorCount} in favor`);
    }
    if (note.opposedCount) {
      voteTallies.push(`${note.opposedCount} opposed`);
    }
    if (note.abstainedCount) {
      voteTallies.push(`${note.abstainedCount} abstained`);
    }
    const outcome =
      note.outcome === "passed" ? "Motion passed." : "Motion failed.";
    return (
      <>
        <p>
          <strong>Vote:</strong> {voteTallies.join(", ")}
        </p>
        <p>
          <strong>{outcome}</strong>
        </p>
      </>
    );
  }
};

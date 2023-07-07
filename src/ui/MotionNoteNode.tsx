import { useState } from "react";
import { NodeControls } from "./NodeControls";
import { SpeakerReference } from "./SpeakerReference";
import { StoredMotionNote } from "../store/SessionStore";
import { useSessionStore } from "./context/SessionStoreContext";

export const MotionNoteNode: React.FC<{ note: StoredMotionNote }> = ({
  note,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [outcome, setOutcome] = useState(note.outcome);
  const [inFavorCount, setInFavorCount] = useState(note.inFavorCount);
  const [opposedCount, setOpposedCount] = useState(note.opposedCount);
  const [abstainedCount, setAbstainedCount] = useState(note.abstainedCount);

  const sessionStore = useSessionStore();

  const handleOutcomeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOutcome(event.target.value as StoredMotionNote["outcome"]);
  };

  const handleInFavorCountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInFavorCount(parseInt(event.target.value));
  };

  const handleOpposedCountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOpposedCount(parseInt(event.target.value));
  };

  const handleAbstainedCountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAbstainedCount(parseInt(event.target.value));
  };

  const handleSave = () => {
    sessionStore.updateNote({
      ...note,
      outcome,
      inFavorCount,
      opposedCount,
      abstainedCount,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setOutcome(note.outcome);
    setInFavorCount(note.inFavorCount);
    setOpposedCount(note.opposedCount);
    setAbstainedCount(note.abstainedCount);
    setIsEditing(false);
  };

  return (
    <NodeControls
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <div>
        <p>
          <SpeakerReference speaker={note.mover} emphasis /> moved that{" "}
          {note.text}.
        </p>
        <p>
          <SpeakerReference speaker={note.seconder} emphasis /> seconded.
        </p>
        {isEditing ? (
          <select value={outcome} onChange={handleOutcomeChange}>
            <option value="passed">Motion passed</option>
            <option value="failed">Motion failed</option>
            <option value="withdrawn">Motion withdrawn</option>
            <option value="tabled">Motion tabled</option>
          </select>
        ) : (
          <MotionOutcomeDisplay note={note} />
        )}
        {isEditing && (outcome === "passed" || outcome === "failed") && (
          <>
            <label>
              In favor:
              <input
                type="number"
                value={inFavorCount}
                onChange={handleInFavorCountChange}
              />
            </label>
            <label>
              Opposed:
              <input
                type="number"
                value={opposedCount}
                onChange={handleOpposedCountChange}
              />
            </label>
            <label>
              Abstained:
              <input
                type="number"
                value={abstainedCount}
                onChange={handleAbstainedCountChange}
              />
            </label>
          </>
        )}
      </div>
    </NodeControls>
  );
};

const MotionOutcomeDisplay: React.FC<{ note: StoredMotionNote }> = ({
  note,
}) => {
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
          <strong>Vote:</strong> {voteTallies.join(", ") || "No vote recorded."}
        </p>
        <p>
          <strong>{outcome}</strong>
        </p>
      </>
    );
  }
};

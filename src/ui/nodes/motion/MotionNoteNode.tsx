import { useState } from "react";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { SpeakerReference } from "../../controls/SpeakerReference";
import { StoredMotionNote, StoredPerson } from "../../../store/types";
import { useSessionStore } from "../../context/SessionStoreContext";
import { PersonSelector } from "../../controls/PersonSelector";
import "./MotionNoteNode.css";

export const MotionNoteNode: React.FC<{ note: StoredMotionNote }> = ({
  note,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const stopEditing = () => {
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  return isEditing ? (
    <MotionNoteEditor existingNote={note} stopEditing={stopEditing} />
  ) : (
    <MotionNoteDisplay note={note} onEdit={startEditing} />
  );
};

type MotionNoteDisplayProps = {
  note: StoredMotionNote;
  onEdit: () => void;
};

const MotionNoteDisplay: React.FC<MotionNoteDisplayProps> = ({
  note,
  onEdit,
}) => {
  const sessionStore = useSessionStore();

  return (
    <NodeControls
      as="li"
      onEdit={onEdit}
      onDelete={() => sessionStore.removeNote(note)}
      className="motion"
    >
      <p>
        <SpeakerReference speaker={note.mover} emphasis /> moved {note.text}
      </p>
      <p>
        <SpeakerReference speaker={note.seconder} emphasis /> seconded.
      </p>
      <MotionOutcomeDisplay note={note} />
    </NodeControls>
  );
};

const MotionOutcomeDisplay: React.FC<{ note: StoredMotionNote }> = ({
  note,
}) => {
  if (note.outcome === "active") {
    return <p>The motion is under discussion.</p>;
  } else if (note.outcome === "withdrawn") {
    return <p>The motion was withdrawn.</p>;
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

type MotionNoteEditorProps = {
  existingNote?: StoredMotionNote;
  topicId?: number;
  beforeIndex?: number;
  stopEditing: () => void;
};

export const MotionNoteEditor: React.FC<MotionNoteEditorProps> = ({
  existingNote,
  topicId,
  beforeIndex,
  stopEditing,
}) => {
  const [text, setText] = useState(existingNote?.text);
  const [mover, setMover] = useState(existingNote?.mover);
  const [seconder, setSeconder] = useState(existingNote?.seconder);
  const [outcome, setOutcome] = useState(existingNote?.outcome ?? "active");
  const [inFavorCount, setInFavorCount] = useState(existingNote?.inFavorCount);
  const [opposedCount, setOpposedCount] = useState(existingNote?.opposedCount);
  const [abstainedCount, setAbstainedCount] = useState(
    existingNote?.abstainedCount
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const sessionStore = useSessionStore();

  if (!existingNote && topicId === undefined) {
    throw new Error("Must provide topicId when creating a new motion note.");
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleMoverChange = (newMover: StoredPerson) => {
    setMover(newMover);
  };

  const handleSeconderChange = (newSeconder: StoredPerson) => {
    setSeconder(newSeconder);
  };

  const handleOutcomeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOutcome(event.target.value as StoredMotionNote["outcome"]);
    if (event.target.value === "withdrawn" || event.target.value === "tabled") {
      setInFavorCount(undefined);
      setOpposedCount(undefined);
      setAbstainedCount(undefined);
    }
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

  const handleSubmit = () => {
    if (!text) {
      setErrorMessage("Text is required.");
      return;
    }
    if (!mover) {
      setErrorMessage("Mover is required.");
      return;
    }
    if (!seconder) {
      setErrorMessage("Seconder is required.");
      return;
    }
    if (!outcome) {
      setErrorMessage("Outcome is required.");
      return;
    }
    setErrorMessage(undefined);

    if (existingNote) {
      sessionStore.updateNote({
        ...existingNote,
        mover,
        seconder,
        text,
        outcome,
        inFavorCount,
        opposedCount,
        abstainedCount,
      });
    } else if (topicId) {
      sessionStore.addNote(
        topicId,
        {
          type: "motion",
          mover,
          seconder,
          text,
          outcome,
          inFavorCount,
          opposedCount,
          abstainedCount,
        },
        beforeIndex
      );
    }
    stopEditing();
  };

  const handleCancel = () => {
    setText(existingNote?.text);
    setMover(existingNote?.mover);
    setSeconder(existingNote?.seconder);
    setOutcome(existingNote?.outcome ?? "active");
    setInFavorCount(existingNote?.inFavorCount);
    setOpposedCount(existingNote?.opposedCount);
    setAbstainedCount(existingNote?.abstainedCount);
    setErrorMessage(undefined);
    stopEditing();
  };

  return (
    <FormNodeControls
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      className="motion"
    >
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <p>
        <label>
          Mover:
          <PersonSelector selectedPerson={mover} onChange={handleMoverChange} />
        </label>
        <label>
          Seconder:
          <PersonSelector
            selectedPerson={seconder}
            onChange={handleSeconderChange}
          />
        </label>
      </p>
      <p>
        <label>
          Text:
          <input
            className="motionText"
            type="text"
            value={text ?? ""}
            onChange={handleTextChange}
          />
        </label>
      </p>
      <p>
        <label>
          Outcome:
          <select value={outcome} onChange={handleOutcomeChange}>
            <option value="active">Motion active</option>
            <option value="passed">Motion passed</option>
            <option value="failed">Motion failed</option>
            <option value="withdrawn">Motion withdrawn</option>
            <option value="tabled">Motion tabled</option>
          </select>
        </label>
      </p>
      {(outcome === "passed" || outcome === "failed") && (
        <>
          <label>
            In favor:
            <input
              type="number"
              value={inFavorCount ?? 0}
              onChange={handleInFavorCountChange}
            />
          </label>
          <label>
            Opposed:
            <input
              type="number"
              value={opposedCount ?? 0}
              onChange={handleOpposedCountChange}
            />
          </label>
          <label>
            Abstained:
            <input
              type="number"
              value={abstainedCount ?? 0}
              onChange={handleAbstainedCountChange}
            />
          </label>
        </>
      )}
    </FormNodeControls>
  );
};

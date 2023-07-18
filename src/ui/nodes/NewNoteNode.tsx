import { FC, useState } from "react";
import "./NewNoteNode.css";
import { TextNoteEditor } from "./text/TextNoteNode";
import { ActionItemNoteEditor } from "./action-item/ActionItemNoteNode";
import { MotionNoteEditor } from "./motion/MotionNoteNode";

export type NewNoteNodeProps = {
  topicId: number;
  beforeIndex?: number;
  alwaysExpanded: boolean;
};
export const NewNoteNode: FC<NewNoteNodeProps> = ({
  topicId,
  beforeIndex,
  alwaysExpanded,
}) => {
  const [isExpanded, setExpanded] = useState(alwaysExpanded);
  const [addingType, setAddingType] = useState<"text" | "motion" | "action">();

  const onAddTextNote = () => {
    setAddingType("text");
  };
  const onAddMotion = () => {
    setAddingType("motion");
  };
  const onAddActionItem = () => {
    setAddingType("action");
  };
  const stopAdding = () => {
    setAddingType(undefined);
  };
  if (!isExpanded) {
    return (
      <li className="newNotePlaceholderContainer">
        <button
          className="newNotePlaceholder expandClose"
          aria-label="Add Note Placeholder"
          onClick={() => setExpanded(true)}
        >
          +
        </button>
      </li>
    );
  }
  if (!addingType) {
    return (
      <li className="newNoteContainer">
        {!alwaysExpanded && (
          <button
            className="expandClose"
            onClick={() => setExpanded(false)}
            aria-label="Close"
          >
            -
          </button>
        )}
        <NewNoteButton onClick={onAddTextNote} label="Add Text Note" />
        <NewNoteButton onClick={onAddMotion} label="Add Motion" />
        <NewNoteButton onClick={onAddActionItem} label="Add Action Item" />
      </li>
    );
  }
  switch (addingType) {
    case "text":
      return (
        <TextNoteEditor
          stopEditing={stopAdding}
          topicId={topicId}
          beforeIndex={beforeIndex}
        />
      );
    case "motion":
      return (
        <MotionNoteEditor
          stopEditing={stopAdding}
          topicId={topicId}
          beforeIndex={beforeIndex}
        />
      );
    case "action":
      return (
        <ActionItemNoteEditor
          stopEditing={stopAdding}
          topicId={topicId}
          beforeIndex={beforeIndex}
        />
      );
  }
};

const NewNoteButton: FC<{ onClick: () => void; label: string }> = ({
  onClick,
  label,
}) => {
  return (
    <button className="newNote" onClick={onClick} aria-label={label}>
      <i className="material-icons">add</i>
      {label}
    </button>
  );
};

export type NewNoteEditorProps = {
  topicId: number;
  beforeIndex?: number;
  stopEditing: () => void;
};

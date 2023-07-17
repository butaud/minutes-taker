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
  const [isHovered, setIsHovered] = useState(false);
  const [addingType, setAddingType] = useState<"text" | "motion" | "action">();
  const [delayHandler, setDelayHandler] = useState<
    ReturnType<typeof setTimeout> | undefined
  >();

  const isExpanded = alwaysExpanded || isHovered;

  const onMouseEnterPlaceholder = () => {
    setDelayHandler(setTimeout(() => setIsHovered(true), 500));
  };

  const onMouseLeavePlaceholder = () => {
    if (delayHandler) {
      clearTimeout(delayHandler);
    }
    setDelayHandler(undefined);
  };

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
      <div className="newNotePlaceholderContainer">
        <hr
          className="material-icons newNotePlaceholder"
          aria-label="Add Note Placeholder"
          onMouseEnter={onMouseEnterPlaceholder}
          onMouseLeave={onMouseLeavePlaceholder}
        />
      </div>
    );
  }
  if (!addingType) {
    return (
      <div
        className="newNoteContainer"
        onMouseLeave={() => setIsHovered(false)}
      >
        <NewNoteButton onClick={onAddTextNote} label="Add Text Note" />
        <NewNoteButton onClick={onAddMotion} label="Add Motion" />
        <NewNoteButton onClick={onAddActionItem} label="Add Action Item" />
      </div>
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

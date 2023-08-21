import { FC, useState } from "react";
import "./NewNoteNode.css";
import { TextNoteEditor } from "./text/TextNoteNode";
import { ActionItemNoteEditor } from "./action-item/ActionItemNoteNode";
import { MotionNoteEditor } from "./motion/MotionNoteNode";
import { InlineNewNodeButton } from "../controls/InlineNewNodeButton";
import { LinkNoteEditor } from "./link-note/LinkNoteNode";

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
  const [addingType, setAddingType] = useState<
    "text" | "motion" | "action" | "link"
  >();

  const onAddTextNote = () => {
    setAddingType("text");
  };
  const onAddMotion = () => {
    setAddingType("motion");
  };
  const onAddActionItem = () => {
    setAddingType("action");
  };
  const onAddLinkNote = () => {
    setAddingType("link");
  };
  const stopAdding = () => {
    setAddingType(undefined);
  };
  if (!isExpanded) {
    return (
      <InlineNewNodeButton
        onClick={() => setExpanded(true)}
        label="Add Note Inline"
        index={beforeIndex}
      />
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
        <NewNoteButton
          onClick={onAddTextNote}
          label="Add Text Note"
          className="text"
        />
        <NewNoteButton
          onClick={onAddLinkNote}
          label="Add Link Note"
          className="link"
        />
        <NewNoteButton
          onClick={onAddMotion}
          label="Add Motion"
          className="motion"
        />
        <NewNoteButton
          onClick={onAddActionItem}
          label="Add Action Item"
          className="actionItem"
        />
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
    case "link":
      return (
        <LinkNoteEditor
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

const NewNoteButton: FC<{
  onClick: () => void;
  label: string;
  className?: string;
}> = ({ onClick, label, className }) => {
  return (
    <button
      className={"newNote " + className ?? ""}
      onClick={onClick}
      aria-label={label}
    >
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

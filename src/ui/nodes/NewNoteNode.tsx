import { FC, useState } from "react";
import "./NewNoteNode.css";
import { NewTextNoteEditor } from "./text/TextNoteNode";

export type NewNoteNodeProps = {
  topicId: number;
};
export const NewNoteNode: FC<NewNoteNodeProps> = ({ topicId }) => {
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
  if (!addingType) {
    return (
      <div className="newNoteContainer">
        <NewNoteButton onClick={onAddTextNote} label="Add Text Note" />
        <NewNoteButton onClick={onAddMotion} label="Add Motion" />
        <NewNoteButton onClick={onAddActionItem} label="Add Action Item" />
      </div>
    );
  }
  switch (addingType) {
    case "text":
      return <NewTextNoteEditor stopAdding={stopAdding} topicId={topicId} />;
    case "motion":
      return <>todo</>;
    case "action":
      return <>todo</>;
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
  stopAdding: () => void;
};

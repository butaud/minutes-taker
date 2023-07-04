import React from "react";
import "./NodeControls.css";

type NodeControlsProps = {
  isEditing: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

export const NodeControls = ({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  children,
}: React.PropsWithChildren<NodeControlsProps>) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="node-container"
    >
      {children}
      {isHovered &&
        (isEditing ? (
          <EditingButtons onSave={onSave} onCancel={onCancel} />
        ) : (
          <NotEditingButtons onEdit={onEdit} onDelete={onDelete} />
        ))}
    </div>
  );
};

const NotEditingButtons = ({
  onEdit,
  onDelete,
}: Pick<NodeControlsProps, "onEdit" | "onDelete">) => {
  const editCallback = React.useCallback(() => {
    onEdit?.();
  }, [onEdit]);
  const deleteCallback = React.useCallback(() => {
    onDelete?.();
  }, [onDelete]);
  return (
    <span className="node-controls">
      <button onClick={editCallback}>Edit</button>
      <button onClick={deleteCallback}>Delete</button>
    </span>
  );
};

const EditingButtons = ({
  onSave,
  onCancel,
}: Pick<NodeControlsProps, "onSave" | "onCancel">) => {
  const saveCallback = React.useCallback(() => {
    onSave?.();
  }, [onSave]);
  const cancelCallback = React.useCallback(() => {
    onCancel?.();
  }, [onCancel]);
  return (
    <span className="node-controls">
      <button onClick={saveCallback}>Save</button>
      <button onClick={cancelCallback}>Cancel</button>
    </span>
  );
};

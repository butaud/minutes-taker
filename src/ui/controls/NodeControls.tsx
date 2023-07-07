import React from "react";
import "./NodeControls.css";

type NodeControlsProps = {
  isEditing: boolean;
  onEdit: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onStopEditing?: () => void;
};

export const NodeControls = ({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onStopEditing,
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
          <EditingButtons
            onSave={onSave}
            onCancel={onCancel}
            onStopEditing={onStopEditing}
          />
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
    onEdit();
  }, [onEdit]);
  const deleteCallback = React.useCallback(() => {
    onDelete?.();
  }, [onDelete]);
  return (
    <span className="node-controls">
      <button onClick={editCallback}>Edit</button>
      {onDelete && <button onClick={deleteCallback}>Delete</button>}
    </span>
  );
};

const EditingButtons = ({
  onSave,
  onCancel,
  onStopEditing,
}: Pick<NodeControlsProps, "onSave" | "onCancel" | "onStopEditing">) => {
  const saveCallback = React.useCallback(() => {
    onSave?.();
  }, [onSave]);
  const cancelCallback = React.useCallback(() => {
    onCancel?.();
  }, [onCancel]);
  const stopEditingCallback = React.useCallback(() => {
    onStopEditing?.();
  }, [onStopEditing]);

  return (
    <span className="node-controls">
      {onSave && <button onClick={saveCallback}>Save</button>}
      {onCancel && <button onClick={cancelCallback}>Cancel</button>}
      {onStopEditing && (
        <button onClick={stopEditingCallback}>Stop Editing</button>
      )}
    </span>
  );
};

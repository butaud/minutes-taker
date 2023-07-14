import React from "react";
import "./NodeControls.css";

type NodeControlsProps = {
  onEdit: () => void;
  onDelete?: () => void;
  className?: string;
};

export const NodeControls = ({
  onEdit,
  onDelete,
  children,
  className,
}: React.PropsWithChildren<NodeControlsProps>) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const editCallback = React.useCallback(() => {
    onEdit();
  }, [onEdit]);
  const deleteCallback = React.useCallback(() => {
    onDelete?.();
  }, [onDelete]);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`node-container ${className}`}
    >
      {children}
      {isHovered && (
        <span className="node-controls">
          <button onClick={editCallback}>Edit</button>
          {onDelete && <button onClick={deleteCallback}>Delete</button>}
        </span>
      )}
    </div>
  );
};

export type NonFormNodeControlsProps = {
  onEdit: () => void;
  onDelete?: () => void;
  onStopEditing: () => void;
  isEditing: boolean;
};

export const NonFormNodeControls: React.FC<
  React.PropsWithChildren<NonFormNodeControlsProps>
> = ({ isEditing, onEdit, onDelete, onStopEditing, children }) => {
  if (isEditing) {
    return (
      <StopEditingControls onStopEditing={onStopEditing}>
        {children}
      </StopEditingControls>
    );
  } else {
    return (
      <NodeControls onEdit={onEdit} onDelete={onDelete}>
        {children}
      </NodeControls>
    );
  }
};

export type FormNodeControlsProps = {
  onCancel: () => void;
  onSubmit: () => void;
  className?: string;
};

export const FormNodeControls: React.FC<
  React.PropsWithChildren<FormNodeControlsProps>
> = ({ onCancel, onSubmit, children, className }) => {
  const submitCallback = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );
  return (
    <form className={`node-container ${className}`} onSubmit={submitCallback}>
      {children}
      <span className="node-controls">
        <button type="submit">Save</button>
        <button onClick={onCancel} type="button">
          Cancel
        </button>
      </span>
    </form>
  );
};

export const StopEditingControls: React.FC<
  React.PropsWithChildren<{
    onStopEditing: () => void;
  }>
> = ({ onStopEditing, children }) => {
  return (
    <div className="node-container">
      {children}
      <span className="node-controls">
        <button onClick={onStopEditing} type="button">
          Stop Editing
        </button>
      </span>
    </div>
  );
};

import React from "react";
import "./NodeControls.css";

type NodeControlsProps = {
  onEdit: () => void;
  onDelete?: () => void;
  className?: string;
  as?: "div" | "h1" | "h2" | "h3" | "li" | "p";
};

export const NodeControls = ({
  onEdit,
  onDelete,
  children,
  className,
  as = "div",
}: React.PropsWithChildren<NodeControlsProps>) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const editCallback = React.useCallback(() => {
    onEdit();
  }, [onEdit]);
  const deleteCallback = React.useCallback(() => {
    onDelete?.();
  }, [onDelete]);
  return (
    <NodeContainer
      as={as}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {children}
      {isHovered && (
        <span className="node-controls">
          <button onClick={editCallback}>Edit</button>
          {onDelete && <button onClick={deleteCallback}>Delete</button>}
        </span>
      )}
    </NodeContainer>
  );
};

const NodeContainer: React.FC<
  React.PropsWithChildren<{
    className?: string;
    as: "div" | "h1" | "h2" | "h3" | "li" | "p";
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }>
> = ({ className, as, children, onMouseEnter, onMouseLeave }) => {
  return React.createElement(
    as,
    {
      className: `node-container ${className ?? ""}`,
      onMouseEnter,
      onMouseLeave,
    },
    children
  );
};

export type NonFormNodeControlsProps = {
  onEdit: () => void;
  onDelete?: () => void;
  onStopEditing: () => void;
  isEditing: boolean;
  className?: string;
};

export const NonFormNodeControls: React.FC<
  React.PropsWithChildren<NonFormNodeControlsProps>
> = ({ isEditing, onEdit, onDelete, onStopEditing, className, children }) => {
  if (isEditing) {
    return (
      <StopEditingControls onStopEditing={onStopEditing} className={className}>
        {children}
      </StopEditingControls>
    );
  } else {
    return (
      <NodeControls onEdit={onEdit} onDelete={onDelete} className={className}>
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
    className?: string;
  }>
> = ({ onStopEditing, className, children }) => {
  return (
    <div className={`node-container ${className ?? ""}`}>
      {children}
      <span className="node-controls">
        <button onClick={onStopEditing} type="button">
          Stop Editing
        </button>
      </span>
    </div>
  );
};

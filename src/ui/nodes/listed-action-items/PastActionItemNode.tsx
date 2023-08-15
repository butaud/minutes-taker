import { FC, useState } from "react";
import {
  StoredPastActionItem,
  StoredPerson,
} from "../../../store/SessionStore";
import { SpeakerReference } from "../../controls/SpeakerReference";
import { useSessionStore } from "../../context/SessionStoreContext";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { OptionalPersonSelector } from "../../controls/PersonSelector";

export const PastActionItemNode: FC<{ item: StoredPastActionItem }> = ({
  item,
}) => {
  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  return editing ? (
    <PastActionItemNodeEditor existingItem={item} stopEditing={stopEditing} />
  ) : (
    <PastActionItemNodeDisplay item={item} onEdit={handleEdit} />
  );
};

const PastActionItemNodeDisplay: FC<{
  item: StoredPastActionItem;
  onEdit: () => void;
}> = ({ item, onEdit }) => {
  const sessionStore = useSessionStore();

  const handleDelete = () => {
    sessionStore.removePastActionItem(item);
  };

  return (
    <NodeControls onEdit={onEdit} onDelete={handleDelete} as="li">
      <SpeakerReference speaker={item.assignee} emphasis /> to {item.text} by{" "}
      {item.dueDate.toLocaleDateString("en-US", {
        dateStyle: "short",
        timeZone: "UTC",
      })}
      . {item.completed ? "(Done)" : "(Carry Forward)"}
    </NodeControls>
  );
};

type PastActionItemNodeEditorProps = {
  existingItem?: StoredPastActionItem;
  stopEditing: () => void;
};

export const PastActionItemNodeEditor: FC<PastActionItemNodeEditorProps> = ({
  existingItem,
  stopEditing,
}) => {
  const sessionStore = useSessionStore();

  const [assignee, setAssignee] = useState(existingItem?.assignee);
  const [text, setText] = useState(existingItem?.text);
  const [dueDate, setDueDate] = useState(existingItem?.dueDate);
  const [completed, setCompleted] = useState(existingItem?.completed ?? false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = () => {
    if (!assignee || !text || !dueDate) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (existingItem) {
      sessionStore.updatePastActionItem({
        id: existingItem.id,
        assignee,
        text,
        dueDate,
        completed,
      });
    } else {
      sessionStore.addPastActionItem({
        assignee,
        text,
        dueDate,
        completed,
      });
    }
    stopEditing();
  };

  const handleCancel = () => {
    setErrorMessage(undefined);
    setAssignee(existingItem?.assignee);
    setText(existingItem?.text);
    setDueDate(existingItem?.dueDate);
    setCompleted(existingItem?.completed ?? false);
    stopEditing();
  };

  const handleAssigneeChange = (person: StoredPerson | undefined) => {
    setAssignee(person);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(new Date(event.target.value));
  };

  const handleCompletedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCompleted(event.target.checked);
  };

  return (
    <FormNodeControls onSubmit={handleSubmit} onCancel={handleCancel}>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <input
        type="checkbox"
        checked={completed}
        onChange={handleCompletedChange}
        aria-label="Completed"
      />
      <OptionalPersonSelector
        selectedPerson={assignee}
        onChange={handleAssigneeChange}
        ariaLabel="Assignee"
      />
      to:{" "}
      <input
        type="text"
        value={text ?? ""}
        onChange={handleTextChange}
        aria-label="Action item text"
      />
      by:{" "}
      <input
        type="date"
        value={dueDate?.toISOString().slice(0, 10) ?? ""}
        onChange={handleDueDateChange}
        aria-label="Due date"
      />
    </FormNodeControls>
  );
};

export const NewPastActionItemNode: FC = () => {
  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  return editing ? (
    <PastActionItemNodeEditor stopEditing={stopEditing} />
  ) : (
    <li>
      <button onClick={handleEdit} aria-label="Add Action Item">
        <i className="material-icons">add</i>
        Add Action Item
      </button>
    </li>
  );
};

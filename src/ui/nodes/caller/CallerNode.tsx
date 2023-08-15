import React, { useState } from "react";
import { StoredCaller, StoredPerson } from "../../../store/types";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { useSessionStore } from "../../context/SessionStoreContext";
import { SpeakerReference } from "../../controls/SpeakerReference";
import { OptionalPersonSelector } from "../../controls/PersonSelector";
import "./CallerNode.css";

export const CallerNode: React.FC<{ caller: StoredCaller }> = ({ caller }) => {
  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleStopEditing = () => {
    setEditing(false);
  };

  if (editing) {
    return <CallerEditor caller={caller} stopEditing={handleStopEditing} />;
  } else {
    return <CallerDisplay caller={caller} onEdit={handleEdit} />;
  }
};

export const CallerDisplay: React.FC<{
  caller: StoredCaller;
  onEdit: () => void;
}> = ({ caller, onEdit }) => (
  <NodeControls as="p" onEdit={onEdit}>
    {caller ? (
      <>
        <SpeakerReference speaker={caller.person} emphasis />, {caller.role},
        called the meeting to order.
      </>
    ) : (
      <>The meeting was called to order.</>
    )}
  </NodeControls>
);

type CallerEditorProps = {
  caller: StoredCaller;
  stopEditing: () => void;
};

export const CallerEditor: React.FC<CallerEditorProps> = ({
  caller,
  stopEditing,
}) => {
  const sessionStore = useSessionStore();
  const [person, setPerson] = useState<StoredPerson | undefined>(
    caller?.person
  );
  const [role, setRole] = useState<string | undefined>(caller?.role);

  const handleSave = () => {
    if (person && role) {
      sessionStore.updateCaller({
        person,
        role,
      });
    } else {
      sessionStore.updateCaller(undefined);
    }
    stopEditing();
  };

  const handlePersonChange = (person: StoredPerson | undefined) => {
    setPerson(person);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value);
  };

  return (
    <FormNodeControls
      onCancel={stopEditing}
      onSubmit={handleSave}
      className="caller"
    >
      <label>
        <span>Caller</span>
        <OptionalPersonSelector
          selectedPerson={person}
          onChange={handlePersonChange}
        />
      </label>
      <label>
        <span>Role</span>
        <input type="text" value={role ?? ""} onChange={handleRoleChange} />
      </label>
    </FormNodeControls>
  );
};

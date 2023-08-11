import { useState } from "react";
import { StoredCommittee } from "../../../store/SessionStore";
import { useSessionStore } from "../../context/SessionStoreContext";
import { CommitteeType } from "minutes-model";
import { FormNodeControls } from "../../controls/NodeControls";

type CommitteeEditorProps = {
  existingCommittee?: StoredCommittee;
  stopEditing: () => void;
};

export const CommitteeEditor: React.FC<CommitteeEditorProps> = ({
  existingCommittee,
  stopEditing,
}) => {
  const sessionStore = useSessionStore();

  const [name, setName] = useState(existingCommittee?.name);
  const [type, setType] = useState(existingCommittee?.type ?? "Board");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = () => {
    if (!name) {
      setErrorMessage("Name cannot be empty.");
      return;
    }

    if (existingCommittee) {
      sessionStore.updateCommittee({ id: existingCommittee.id, name, type });
    } else {
      sessionStore.addCommittee({ name, type });
    }
    stopEditing();
  };

  const handleCancel = () => {
    setErrorMessage(undefined);
    setName(existingCommittee?.name);
    setType(existingCommittee?.type ?? "Board");
    stopEditing();
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value as CommitteeType);
  };

  return (
    <FormNodeControls
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      className="committee"
    >
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <i className="material-icons">{existingCommittee ? "edit" : "add"}</i>
      <input
        autoFocus
        type="text"
        value={name ?? ""}
        onChange={handleNameChange}
        aria-label="Committee Name"
      />
      <select
        value={type}
        onChange={handleTypeChange}
        aria-label="Committee Type"
      >
        <option value="Board">Board</option>
        <option value="Headmaster">Headmaster</option>
      </select>
    </FormNodeControls>
  );
};

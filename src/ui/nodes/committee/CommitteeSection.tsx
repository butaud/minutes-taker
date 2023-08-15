import { useState } from "react";
import { StoredCommittee } from "../../../store/types";
import { CommitteeEditor } from "./CommitteeEditor";
import { CommitteeNode } from "./CommitteeNode";
import "./CommitteeSection.css";
import { useSessionStore } from "../../context/SessionStoreContext";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";

export type CommitteeSectionProps = {
  committeeDocUrl?: string;
  committees: readonly StoredCommittee[];
};

export const CommitteeSection: React.FC<CommitteeSectionProps> = ({
  committeeDocUrl,
  committees,
}) => {
  return (
    <>
      <CommitteeHeader committeeDocUrl={committeeDocUrl} />
      <ul className="committee">
        {committees.map((committee) => (
          <CommitteeNode committee={committee} key={committee.id} />
        ))}
        <NewCommitteeNode />
      </ul>
    </>
  );
};

const CommitteeHeader: React.FC<{ committeeDocUrl?: string }> = ({
  committeeDocUrl,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const sessionStore = useSessionStore();

  const [draftUrl, setDraftUrl] = useState(committeeDocUrl);

  const handleSubmit = () => {
    sessionStore.updateCommitteeDocUrl(draftUrl ? draftUrl : undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftUrl(committeeDocUrl);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <FormNodeControls onCancel={handleCancel} onSubmit={handleSubmit}>
        <h3 className="committee">
          Active Committees
          <label>
            Committee Details URL:
            <input
              autoFocus
              type="text"
              value={draftUrl ?? ""}
              onChange={(event) => setDraftUrl(event.target.value)}
            />
          </label>
        </h3>
      </FormNodeControls>
    );
  } else {
    return (
      <NodeControls as="div" onEdit={() => setIsEditing(true)}>
        <h3 className="committee">
          Active Committees
          {committeeDocUrl && (
            <a href={committeeDocUrl} target="_blank" className="committee">
              (Committee Details)
            </a>
          )}
        </h3>
      </NodeControls>
    );
  }
};

const NewCommitteeNode: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <CommitteeEditor stopEditing={() => setIsEditing(false)} />
  ) : (
    <li>
      <button onClick={() => setIsEditing(true)} aria-label="Add Committee">
        <i className="material-icons">add</i>
        Add Committee
      </button>
    </li>
  );
};

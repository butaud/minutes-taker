import { useState } from "react";
import { StoredCommittee } from "../../../store/types";
import { NodeControls } from "../../controls/NodeControls";
import { CommitteeEditor } from "./CommitteeEditor";
import { useSessionStore } from "../../context/SessionStoreContext";

type CommitteeNodeProps = {
  committee: StoredCommittee;
};

export const CommitteeNode: React.FC<CommitteeNodeProps> = ({ committee }) => {
  const [isEditing, setIsEditing] = useState(false);
  const sessionStore = useSessionStore();

  const onDelete = () => {
    sessionStore.removeCommittee(committee);
  };

  return isEditing ? (
    <CommitteeEditor
      existingCommittee={committee}
      stopEditing={() => setIsEditing(false)}
    />
  ) : (
    <NodeControls as="li" onEdit={() => setIsEditing(true)} onDelete={onDelete}>
      {committee.name} ({committee.type})
    </NodeControls>
  );
};

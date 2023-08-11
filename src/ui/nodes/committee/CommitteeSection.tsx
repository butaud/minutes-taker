import { useState } from "react";
import { StoredCommittee } from "../../../store/SessionStore";
import { CommitteeEditor } from "./CommitteeEditor";
import { CommitteeNode } from "./CommitteeNode";

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
      <h3>Active Committees</h3>
      {committeeDocUrl && (
        <a href={committeeDocUrl} target="_blank">
          Committee Details
        </a>
      )}
      <ul>
        {committees.map((committee) => (
          <CommitteeNode committee={committee} key={committee.id} />
        ))}
        <NewCommitteeNode />
      </ul>
    </>
  );
};

const NewCommitteeNode: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <CommitteeEditor stopEditing={() => setIsEditing(false)} />
  ) : (
    <li>
      <button onClick={() => setIsEditing(true)}>Add Committee</button>
    </li>
  );
};

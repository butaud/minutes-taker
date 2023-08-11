import { StoredCommittee } from "../../../store/SessionStore";
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
      </ul>
    </>
  );
};

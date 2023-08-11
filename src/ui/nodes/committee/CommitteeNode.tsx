import { StoredCommittee } from "../../../store/SessionStore";

type CommitteeNodeProps = {
  committee: StoredCommittee;
};

export const CommitteeNode: React.FC<CommitteeNodeProps> = ({ committee }) => {
  return (
    <li>
      {committee.name} ({committee.type})
    </li>
  );
};

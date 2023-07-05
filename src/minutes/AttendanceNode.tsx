import { Person } from "minute-model";
import "./AttendanceNode.css";

type AttendanceNodeProps = {
  present: Person[];
  absent: Person[];
  administrationPresent: Person[];
};

export const AttendanceNode: React.FC<AttendanceNodeProps> = ({
  present,
  absent,
  administrationPresent,
}) => {
  return (
    <div className="attendance-container">
      <p>
        <strong>Members in attendance: </strong>
        {present.map((person) => person.lastName).join(", ")}
      </p>
      <p>
        <strong>Members not in attendance: </strong>
        {absent.map((person) => person.lastName).join(", ")}
      </p>
      <p>
        <strong>Administration: </strong>
        {administrationPresent.map((person) => person.lastName).join(", ")}
      </p>
    </div>
  );
};

import { useMemo } from "react";
import "./InlineNewNodeButton.css";

let describedById = 0;

export const InlineNewNodeButton: React.FC<{
  label: string;
  onClick: () => void;
  index?: number;
}> = ({ label, onClick, index }) => {
  const id = useMemo(() => describedById++, []);
  const descriptionId = `inline-description-${id}`;
  return (
    <li className="inlineNewButtonContainer">
      <button
        className="inlineNewButton"
        onClick={onClick}
        title={label}
        aria-label={label}
        aria-describedby={descriptionId}
      >
        <i className="material-icons md-18">add</i>
      </button>
      <p id={descriptionId} style={{ display: "none" }}>
        {index && <>Insert at position {index}</>}
      </p>
    </li>
  );
};

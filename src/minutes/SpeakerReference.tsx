import { Person } from "minute-model";
import "./SpeakerReference.css";

type SpeakerReferenceProps = {
  speaker: Person;
  emphasis?: boolean;
};

export const SpeakerReference: React.FC<SpeakerReferenceProps> = ({
  speaker,
  emphasis,
}) => {
  return (
    <span className={emphasis ? "speaker-em" : "speaker"}>
      Mr. {speaker.lastName}
    </span>
  );
};

import { Person } from "minutes-model";
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
      {speaker.title} {speaker.lastName}
    </span>
  );
};

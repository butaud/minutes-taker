import { Topic } from "minute-model";
import { NoteNode } from "./NoteNode";
import "./TopicNode.css";
import { SpeakerReference } from "./SpeakerReference";

export const TopicNode: React.FC<{ topic: Topic }> = ({ topic }) => {
  return (
    <div>
      <h3>{topic.title}</h3>
      {topic.leader && (
        <p>
          Lead by <SpeakerReference speaker={topic.leader} emphasis />
        </p>
      )}
      {topic.notes.map((note) => (
        <NoteNode note={note} />
      ))}
    </div>
  );
};

import { Person } from "minute-model";
import "./AttendanceNode.css";
import { useState } from "react";
import { NodeControls } from "./NodeControls";

type PersonListProps = {
  title: string;
  people: Person[];
  isEditing: boolean;
};

const PersonList: React.FC<PersonListProps> = ({
  title,
  people,
  isEditing,
}) => {
  const [newPerson, setNewPerson] = useState("");

  const handleNewPersonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPerson(event.target.value);
  };

  const handleAddPerson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [firstName, lastName] = newPerson.split(" ");
    if (firstName && lastName) {
      const newPerson = { firstName, lastName };
      people.push(newPerson);
      setNewPerson("");
    }
  };

  const handleRemovePerson = (person: Person) => {
    const index = people.indexOf(person);
    if (index !== -1) {
      people.splice(index, 1);
    }
    setNewPerson("");
  };

  return (
    <>
      {!isEditing ? (
        <p>
          <strong>{title}: </strong>
          {people.map((person) => person.lastName).join(", ")}
        </p>
      ) : (
        <>
          <h4>{title}</h4>
          {people.map((person) => (
            <div key={`${person.firstName}-${person.lastName}`}>
              {person.firstName} {person.lastName}{" "}
              <button onClick={() => handleRemovePerson(person)}>Remove</button>
            </div>
          ))}
          <form onSubmit={handleAddPerson}>
            <label>
              Add member to {title.toLowerCase()} list:
              <input
                type="text"
                value={newPerson}
                onChange={handleNewPersonChange}
              />
            </label>
            <button type="submit">Add</button>
          </form>
        </>
      )}
    </>
  );
};

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
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleStopEditingClick = () => {
    setIsEditing(false);
  };
  return (
    <div className="attendance-container">
      <NodeControls
        isEditing={isEditing}
        onEdit={handleEditClick}
        onStopEditing={handleStopEditingClick}
      >
        <PersonList
          title="Members in attendance"
          people={present}
          isEditing={isEditing}
        />
        <PersonList
          title="Members not in attendance"
          people={absent}
          isEditing={isEditing}
        />
        <PersonList
          title="Administration"
          people={administrationPresent}
          isEditing={isEditing}
        />
      </NodeControls>
    </div>
  );
};

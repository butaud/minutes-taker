import { Person } from "minute-model";
import "./AttendanceNode.css";
import { useState } from "react";
import { NodeControls } from "./NodeControls";
import { Immutable } from "../store/SessionStore";
import { useSessionStore } from "../store/SessionStoreContext";

type PersonListProps = {
  title: string;
  people: readonly Immutable<Person>[];
  updatePeople: (people: readonly Immutable<Person>[]) => void;
  isEditing: boolean;
};

const PersonList: React.FC<PersonListProps> = ({
  title,
  people,
  updatePeople,
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
      updatePeople([...people, newPerson]);
      setNewPerson("");
    }
  };

  const handleRemovePerson = (person: Person) => {
    updatePeople(people.filter((p) => p !== person));
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
  present: readonly Immutable<Person>[];
  absent: readonly Immutable<Person>[];
  administrationPresent: readonly Immutable<Person>[];
};

export const AttendanceNode: React.FC<AttendanceNodeProps> = ({
  present,
  absent,
  administrationPresent,
}) => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleStopEditingClick = () => {
    setIsEditing(false);
  };

  const updateMembersPresent = (people: readonly Immutable<Person>[]) => {
    sessionStore.setMembersPresent(people);
  };

  const updateMembersAbsent = (people: readonly Immutable<Person>[]) => {
    sessionStore.setMembersAbsent(people);
  };

  const updateAdministrationPresent = (
    people: readonly Immutable<Person>[]
  ) => {
    sessionStore.setAdministrationPresent(people);
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
          updatePeople={updateMembersPresent}
          isEditing={isEditing}
        />
        <PersonList
          title="Members not in attendance"
          people={absent}
          updatePeople={updateMembersAbsent}
          isEditing={isEditing}
        />
        <PersonList
          title="Administration"
          people={administrationPresent}
          updatePeople={updateAdministrationPresent}
          isEditing={isEditing}
        />
      </NodeControls>
    </div>
  );
};

import { Person } from "minutes-model";
import "./AttendanceNode.css";
import { useState } from "react";
import { NonFormNodeControls } from "../../controls/NodeControls";
import { useSessionStore } from "../../context/SessionStoreContext";
import { StoredPerson } from "../../../store/SessionStore";

type PersonListProps = {
  title: string;
  people: readonly StoredPerson[];
  addPerson: (newPerson: Person) => void;
  removePerson: (person: StoredPerson) => void;
  isEditing: boolean;
};

const PersonList: React.FC<PersonListProps> = ({
  title,
  people,
  addPerson,
  removePerson,
  isEditing,
}) => {
  const [newPerson, setNewPerson] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleNewPersonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPerson(event.target.value);
  };

  const handleAddPerson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [firstName, lastName] = newPerson.split(" ");
    if (firstName && lastName) {
      setErrorMessage(undefined);
      addPerson({ firstName, lastName });
      setNewPerson("");
    } else {
      setErrorMessage("Please enter a first and last name.");
    }
  };

  const handleRemovePerson = (person: StoredPerson) => {
    setErrorMessage(undefined);
    try {
      removePerson(person);
    } catch (error) {
      setErrorMessage(`${error}`);
    }
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
            {errorMessage && <p role="alert">{errorMessage}</p>}
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
  present: readonly StoredPerson[];
  absent: readonly StoredPerson[];
  administrationPresent: readonly StoredPerson[];
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

  return (
    <div className="attendance-container">
      <NonFormNodeControls
        isEditing={isEditing}
        onEdit={handleEditClick}
        onStopEditing={handleStopEditingClick}
      >
        <PersonList
          title="Members in attendance"
          people={present}
          addPerson={sessionStore.addMemberPresent}
          removePerson={sessionStore.removeMemberPresent}
          isEditing={isEditing}
        />
        <PersonList
          title="Members not in attendance"
          people={absent}
          addPerson={sessionStore.addMemberAbsent}
          removePerson={sessionStore.removeMemberAbsent}
          isEditing={isEditing}
        />
        <PersonList
          title="Administration"
          people={administrationPresent}
          addPerson={sessionStore.addAdministrationPresent}
          removePerson={sessionStore.removeAdministrationPresent}
          isEditing={isEditing}
        />
      </NonFormNodeControls>
    </div>
  );
};

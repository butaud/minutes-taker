import { Person, PersonTitle } from "minutes-model";
import "./AttendanceNode.css";
import { useState } from "react";
import { NonFormNodeControls } from "../../controls/NodeControls";
import { useSessionStore } from "../../context/SessionStoreContext";
import { StoredPerson } from "../../../store/types";

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
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

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
          {errorMessage && <p role="alert">{errorMessage}</p>}
          <ul>
            {people.map((person) => (
              <li key={`${person.firstName}-${person.lastName}`}>
                {person.firstName} {person.lastName}{" "}
                <button onClick={() => handleRemovePerson(person)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <NewPerson personListTitle={title} addPerson={addPerson} />
        </>
      )}
    </>
  );
};

type NewPersonProps = {
  personListTitle: string;
  addPerson: (newPerson: Person) => void;
};

const NewPerson: React.FC<NewPersonProps> = ({
  addPerson,
  personListTitle,
}) => {
  const [title, setTitle] = useState("Mr.");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleTitleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTitle(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [firstName, lastName] = name.split(" ");
    if (firstName && lastName) {
      setErrorMessage(undefined);
      addPerson({ title: title as PersonTitle, firstName, lastName });
      setTitle("Mr.");
      setName("");
    } else {
      setErrorMessage("Please enter a first and last name.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <i className="material-icons">person_add</i>
      <select
        value={title}
        onChange={handleTitleChange}
        aria-label={`Title to add to ${personListTitle}`}
      >
        <option>Mr.</option>
        <option>Mrs.</option>
        <option>Miss</option>
      </select>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        aria-label={`Name to add to ${personListTitle}`}
      />
      <button type="submit">Add</button>
    </form>
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
    <NonFormNodeControls
      isEditing={isEditing}
      onEdit={handleEditClick}
      onStopEditing={handleStopEditingClick}
      className="attendance-container"
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
  );
};

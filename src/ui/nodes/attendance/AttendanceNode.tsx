import { Person, PersonTitle } from "minutes-model";
import "./AttendanceNode.css";
import React, { ChangeEvent, useState } from "react";
import { NonFormNodeControls } from "../../controls/NodeControls";
import { useSessionStore } from "../../context/SessionStoreContext";
import { StoredPerson } from "../../../store/types";

type PersonListProps = {
  list: MoveDestination;
  people: readonly StoredPerson[];
  addPerson: (newPerson: Person) => void;
  removePerson: (person: StoredPerson) => void;
  movePerson: (person: StoredPerson, destination: MoveDestination) => void;
  isEditing: boolean;
};

type MoveDestination =
  | "membersPresent"
  | "membersAbsent"
  | "administrationPresent"
  | "othersReferenced";

const titles: Record<MoveDestination, string> = {
  membersPresent: "Members in attendance",
  membersAbsent: "Members not in attendance",
  administrationPresent: "Administration",
  othersReferenced: "Others referenced",
};

const PersonList: React.FC<PersonListProps> = ({
  list,
  people,
  addPerson,
  removePerson,
  movePerson,
  isEditing,
}) => {
  const title = titles[list];

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
          <ul>
            {people.map((person) => (
              <PersonEditor
                key={person.id}
                list={list}
                person={person}
                removePerson={removePerson}
                movePerson={movePerson}
              />
            ))}
          </ul>
          <NewPerson personListTitle={title} addPerson={addPerson} />
        </>
      )}
    </>
  );
};

type PersonEditorProps = {
  list: MoveDestination;
  person: StoredPerson;
  removePerson: (person: StoredPerson) => void;
  movePerson: (person: StoredPerson, destination: MoveDestination) => void;
};

const PersonEditor = ({
  list,
  person,
  removePerson,
  movePerson,
}: PersonEditorProps) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [moveDestination, setMoveDestination] = useState<
    MoveDestination | undefined
  >();

  const handleMoveDestinationChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setMoveDestination(event.target.value as MoveDestination);
  };

  const handleRemovePerson = (person: StoredPerson) => {
    setErrorMessage(undefined);
    try {
      removePerson(person);
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  const handleMovePerson = (person: StoredPerson) => {
    setErrorMessage(undefined);
    if (moveDestination) {
      try {
        movePerson(person, moveDestination);
      } catch (error) {
        setErrorMessage(`${error}`);
      }
    } else {
      setErrorMessage("Please select a destination.");
    }
  };

  return (
    <li key={`${person.firstName}-${person.lastName}`}>
      {person.firstName} {person.lastName}{" "}
      <button onClick={() => handleRemovePerson(person)}>Remove</button>
      <button
        onClick={() => handleMovePerson(person)}
        disabled={!moveDestination}
      >
        Move to
      </button>
      <select
        aria-label="Move destination"
        onChange={handleMoveDestinationChange}
        value={moveDestination ?? ""}
      >
        <option value=""></option>
        {Object.entries(titles)
          .filter(([key]) => key !== list)
          .map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
      </select>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </li>
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
  othersReferenced: readonly StoredPerson[];
};

export const AttendanceNode: React.FC<AttendanceNodeProps> = ({
  present,
  absent,
  administrationPresent,
  othersReferenced,
}) => {
  const sessionStore = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleStopEditingClick = () => {
    setIsEditing(false);
  };

  const movePerson = (person: StoredPerson, destination: MoveDestination) => {
    switch (destination) {
      case "membersPresent":
        sessionStore.moveToMemberPresent(person);
        break;
      case "membersAbsent":
        sessionStore.moveToMemberAbsent(person);
        break;
      case "administrationPresent":
        sessionStore.moveToAdministrationPresent(person);
        break;
      case "othersReferenced":
        sessionStore.moveToOtherReferenced(person);
        break;
    }
  };

  return (
    <NonFormNodeControls
      isEditing={isEditing}
      onEdit={handleEditClick}
      onStopEditing={handleStopEditingClick}
      className="attendance-container"
    >
      <PersonList
        list={"membersPresent"}
        people={present}
        addPerson={sessionStore.addMemberPresent}
        removePerson={sessionStore.removeMemberPresent}
        movePerson={movePerson}
        isEditing={isEditing}
      />
      <PersonList
        list={"membersAbsent"}
        people={absent}
        addPerson={sessionStore.addMemberAbsent}
        removePerson={sessionStore.removeMemberAbsent}
        movePerson={movePerson}
        isEditing={isEditing}
      />
      <PersonList
        list={"administrationPresent"}
        people={administrationPresent}
        addPerson={sessionStore.addAdministrationPresent}
        removePerson={sessionStore.removeAdministrationPresent}
        movePerson={movePerson}
        isEditing={isEditing}
      />
      <PersonList
        list={"othersReferenced"}
        people={othersReferenced}
        addPerson={sessionStore.addOtherReferenced}
        removePerson={sessionStore.removeOtherReferenced}
        movePerson={movePerson}
        isEditing={isEditing}
      />
    </NonFormNodeControls>
  );
};

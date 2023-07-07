import { StoredPerson } from "../../store/SessionStore";
import { usePersonList } from "../context/PersonListContext";

type PersonSelectorProps = {
  selectedPerson?: StoredPerson;
  onChange: (newSelectedPerson: StoredPerson) => void;
};

export const PersonSelector: React.FC<PersonSelectorProps> = ({
  selectedPerson,
  onChange,
}) => {
  const personList = usePersonList();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPersonId = parseInt(event.target.value);
    const selectedPerson = personList.find(
      (person) => person.id === selectedPersonId
    );
    if (selectedPerson) {
      onChange(selectedPerson);
    }
  };

  return (
    <select onChange={handleChange}>
      {personList.map((person) => (
        <option
          key={person.id}
          value={person.id}
          selected={person.id === selectedPerson?.id}
        >
          {person.firstName} {person.lastName}
        </option>
      ))}
    </select>
  );
};

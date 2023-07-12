import { StoredPerson } from "../../store/SessionStore";
import { usePersonList } from "../context/PersonListContext";

type PersonSelectorProps = {
  selectedPerson?: StoredPerson;
  onChange: (newSelectedPerson: StoredPerson) => void;
};

type OptionalPersonSelectorProps = {
  selectedPerson: StoredPerson | undefined;
  onChange: (newSelectedPerson: StoredPerson | undefined) => void;
};

type InternalPersonSelectorProps = OptionalPersonSelectorProps & {
  allowNone: boolean;
};
const InternalPersonSelector: React.FC<InternalPersonSelectorProps> = ({
  selectedPerson,
  onChange,
  allowNone,
}) => {
  const personList = usePersonList();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPersonId = parseInt(event.target.value);
    if (selectedPersonId === -1) {
      onChange(undefined);
      return;
    }
    const selectedPerson = personList.find(
      (person) => person.id === selectedPersonId
    );
    if (selectedPerson) {
      onChange(selectedPerson);
    }
  };

  return (
    <select
      onChange={handleChange}
      value={selectedPerson?.id ?? -1}
      aria-label="Person selector"
    >
      {allowNone && <option key={"no-person"} value={-1}></option>}
      {personList.map((person) => (
        <option key={person.id} value={person.id}>
          {person.firstName} {person.lastName}
        </option>
      ))}
    </select>
  );
};

export const PersonSelector: React.FC<PersonSelectorProps> = ({
  selectedPerson,
  onChange,
}) => {
  return (
    <InternalPersonSelector
      selectedPerson={selectedPerson}
      // Null person can't actually be selected in this case
      onChange={(newSelectedPerson) => onChange(newSelectedPerson!!!)}
      allowNone={false}
    />
  );
};

export const OptionalPersonSelector: React.FC<OptionalPersonSelectorProps> = ({
  selectedPerson,
  onChange,
}) => {
  return (
    <InternalPersonSelector
      selectedPerson={selectedPerson}
      onChange={onChange}
      allowNone={true}
    />
  );
};

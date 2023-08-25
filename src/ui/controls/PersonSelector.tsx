import { StoredPerson } from "../../store/types";
import { usePersonList } from "../context/PersonListContext";

type PersonSelectorProps = {
  selectedPerson?: StoredPerson;
  onChange: (newSelectedPerson: StoredPerson) => void;
  ariaLabel?: string;
};

type OptionalPersonSelectorProps = {
  selectedPerson: StoredPerson | undefined;
  onChange: (newSelectedPerson: StoredPerson | undefined) => void;
  ariaLabel?: string;
};

type InternalPersonSelectorProps = OptionalPersonSelectorProps & {
  allowNone: boolean;
};
const InternalPersonSelector: React.FC<InternalPersonSelectorProps> = ({
  selectedPerson,
  onChange,
  allowNone,
  ariaLabel,
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
      aria-label={ariaLabel}
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
  ariaLabel,
}) => {
  return (
    <InternalPersonSelector
      selectedPerson={selectedPerson}
      // Null person can't actually be selected in this case
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onChange={(newSelectedPerson) => onChange(newSelectedPerson!)}
      allowNone={false}
      ariaLabel={ariaLabel}
    />
  );
};

export const OptionalPersonSelector: React.FC<OptionalPersonSelectorProps> = ({
  selectedPerson,
  onChange,
  ariaLabel,
}) => {
  return (
    <InternalPersonSelector
      selectedPerson={selectedPerson}
      onChange={onChange}
      allowNone={true}
      ariaLabel={ariaLabel}
    />
  );
};

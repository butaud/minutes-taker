import {
  StoredCalendar,
  StoredCalendarItem,
} from "../../../store/SessionStore";
import { NonFormNodeControls } from "../../controls/NodeControls";
import { FC, useState } from "react";
import { useSessionStore } from "../../context/SessionStoreContext";
import { CalendarMonth } from "minutes-model";
import "./CalendarNode.css";
import { EditingContext, useEditing } from "../../context/EditingContext";

export const CalendarNode: FC<{ calendar: StoredCalendar }> = ({
  calendar,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const stopEditing = () => {
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const firstMonth = calendar[0]?.month;
  const lastMonth = calendar[calendar.length - 1]?.month;

  return (
    <NonFormNodeControls
      isEditing={isEditing}
      onEdit={startEditing}
      onStopEditing={stopEditing}
      className="calendar"
    >
      <EditingContext.Provider value={isEditing}>
        <h3>
          <button
            className="collapse"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand calendar" : "Collapse calendar"}
          >
            {isCollapsed ? "+" : "-"}
          </button>
          Board Calendar Items
        </h3>
        {isCollapsed ? (
          <div className="placeholder" />
        ) : (
          <ul>
            {isEditing && <NewMonthNode nextMonth={firstMonth} />}
            {calendar.map(({ month, items }) => (
              <CalendarMonthNode
                month={month as CalendarMonth}
                items={items}
                key={month}
              />
            ))}
            {isEditing && lastMonth && (
              <NewMonthNode previousMonth={lastMonth} />
            )}
          </ul>
        )}
      </EditingContext.Provider>
    </NonFormNodeControls>
  );
};

type NewMonthNodeProps = {
  nextMonth?: CalendarMonth;
  previousMonth?: CalendarMonth;
};

const monthArray: CalendarMonth[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getPreviousMonth = (month: CalendarMonth): CalendarMonth => {
  return monthArray[(monthArray.indexOf(month) - 1) % monthArray.length];
};

const getNextMonth = (month: CalendarMonth): CalendarMonth => {
  return monthArray[(monthArray.indexOf(month) + 1) % monthArray.length];
};

const NewMonthNode: FC<NewMonthNodeProps> = ({ nextMonth, previousMonth }) => {
  const myMonth = nextMonth
    ? getPreviousMonth(nextMonth)
    : previousMonth
    ? getNextMonth(previousMonth)
    : undefined;
  if (myMonth) {
    return <NewDefinedMonthNode month={myMonth} atBeginning={!!nextMonth} />;
  } else {
    return <NewAnyMonthNode />;
  }
};

const NewDefinedMonthNode: FC<{
  month: CalendarMonth;
  atBeginning: boolean;
}> = ({ month, atBeginning }) => {
  const sessionStore = useSessionStore();

  const handleClick = () => {
    const index = atBeginning ? 0 : sessionStore.session.calendar.length;
    sessionStore.addCalendarMonth(month, index);
  };

  return (
    <li>
      <button
        className="newMonth"
        onClick={handleClick}
        aria-label={`Add ${month}`}
      >
        <i className="material-icons">add</i>Add {month}
      </button>
    </li>
  );
};

const NewAnyMonthNode: FC = () => {
  const sessionStore = useSessionStore();
  const [month, setMonth] = useState<CalendarMonth | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleAddClick = () => {
    setErrorMessage(undefined);
    if (!month) {
      setErrorMessage("Please select a month");
      return;
    }
    sessionStore.addCalendarMonth(month, 0);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value as CalendarMonth);
  };

  return (
    <li>
      <form onSubmit={handleAddClick}>
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <label htmlFor="month">Add Month: </label>
        <select id="month" value={month} onChange={handleMonthChange}>
          {monthArray.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
    </li>
  );
};

type CalendarMonthNodeProps = {
  month: CalendarMonth;
  items: readonly StoredCalendarItem[];
};
export const CalendarMonthNode: FC<CalendarMonthNodeProps> = ({
  month,
  items,
}) => {
  const isEditing = useEditing();
  const sessionStore = useSessionStore();
  const onDeleteMonth = () => {
    sessionStore.removeCalendarMonth(month);
  };
  return (
    <li>
      <span className="month">
        {isEditing && (
          <button
            className="delete"
            onClick={onDeleteMonth}
            aria-label={`Delete ${month}`}
            title={`Delete ${month}`}
          >
            <i className="material-icons">delete</i>
          </button>
        )}
        {month}
      </span>
      <ul>
        {items.map((item) => (
          <CalendarItemNode item={item} key={item.id} />
        ))}
        {isEditing && <NewCalendarItemNode month={month} />}
      </ul>
    </li>
  );
};

export const NewCalendarItemNode: FC<{ month: CalendarMonth }> = ({
  month,
}) => {
  const sessionStore = useSessionStore();
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleAddClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    if (!text) {
      setErrorMessage("Please enter text");
      return;
    }
    sessionStore.addCalendarItem(month, { text, completed: false });
    setText("");
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <li className="itemEditor">
      <form onSubmit={handleAddClick}>
        <button type="submit">
          <i className="material-icons">add</i>Add
        </button>
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <input
          id="text"
          type="text"
          aria-label="New Item Text"
          value={text}
          onChange={handleTextChange}
        />
      </form>
    </li>
  );
};

export const CalendarItemNode: FC<{ item: StoredCalendarItem }> = ({
  item,
}) => {
  const isEditing = useEditing();
  return isEditing ? (
    <CalendarItemNodeEditor item={item} />
  ) : (
    <CalendarItemNodeDisplay item={item} />
  );
};

export const CalendarItemNodeDisplay: FC<{ item: StoredCalendarItem }> = ({
  item,
}) => {
  return (
    <li>
      <span className={"calendarItem" + (item.completed ? " completed" : "")}>
        {item.text}
      </span>
    </li>
  );
};

export const CalendarItemNodeEditor: FC<{
  item: StoredCalendarItem;
}> = ({ item }) => {
  const sessionStore = useSessionStore();
  const [text, setText] = useState(item.text);
  const [completed, setCompleted] = useState(item.completed);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSaveClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    if (!text) {
      setErrorMessage("Please enter text");
      return;
    }
    sessionStore.updateCalendarItem({ ...item, text, completed });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleCompletedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCompleted(event.target.checked);
  };

  const handleDeleteClick = () => {
    sessionStore.removeCalendarItem(item);
  };

  const canSave = text && (text !== item.text || completed !== item.completed);

  return (
    <li className="itemEditor">
      <form onSubmit={handleSaveClick}>
        <button
          className="delete"
          onClick={handleDeleteClick}
          aria-label="Delete Item"
          title="Delete Item"
          type="button"
        >
          <i className="material-icons">delete</i>
        </button>
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <input
          id="completed"
          type="checkbox"
          aria-label="Completed"
          checked={completed}
          onChange={handleCompletedChange}
        />
        <input
          id="text"
          type="text"
          aria-label="Item text"
          value={text}
          onChange={handleTextChange}
        />
        {canSave && <button type="submit">Save</button>}
      </form>
    </li>
  );
};

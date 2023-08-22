import { useCallback } from "react";

export type TimePickerProps = {
  value: Date;
  onChange: (newValue: Date) => void;
  className?: string;
  id?: string;
  step?: number;
};

const getHoursAndMinutesFromTimeInputValue = (
  value: string
): [number, number] => {
  const [hours, minutes] = value.split(":");
  return [parseInt(hours), parseInt(minutes)];
};

const makeTimeInputValueFromDate = (date: Date): string => {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value: value,
  onChange,
  className,
  id,
  step,
}) => {
  const onValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = getHoursAndMinutesFromTimeInputValue(
        e.target.value
      );
      if (isNaN(hours) || isNaN(minutes)) {
        return;
      }
      const newTime = new Date(value);
      newTime.setUTCHours(hours);
      newTime.setUTCMinutes(minutes);
      onChange(newTime);
    },
    [onChange]
  );

  return (
    <input
      type="time"
      className={className}
      id={id}
      step={step}
      value={makeTimeInputValueFromDate(value)}
      onChange={onValueChange}
    />
  );
};

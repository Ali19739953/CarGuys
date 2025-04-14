import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "../Modules/Calender.module.css";

const CompactCalendar = ({ value1, setValue1, value2, setValue2 }) => (
  <div className={styles.calendarContainer}>
    <div className={styles.compactCalendarWrapper}>
      <Calendar
        onChange={setValue1}
        value={value1}
        className={styles.compactCalendar}
        maxDate={value2}
      />
    </div>

    <div className={styles.compactCalendarWrapper}>
      <Calendar
        onChange={setValue2}
        value={value2}
        className={styles.compactCalendar}
        minDate={value1}
      />
    </div>
  </div>
);

export default CompactCalendar;

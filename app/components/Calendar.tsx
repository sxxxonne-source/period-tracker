"use client"

import { useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { supabase } from "../lib/supabase"

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function CycleCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  function handleDayClick(value: Date) {
    setSelectedDate(startOfDay(value))
  }

  function tileClassName({ date }: { date: Date }) {
    if (!selectedDate) return ""

    const day = startOfDay(date)

    // период 5 дней
    const periodStart = startOfDay(selectedDate)
    const periodEnd = addDays(periodStart, 4)

    // овуляция (14 день)
    const ovulation = addDays(periodStart, 14)

    // фертильные дни ±2 дня
    const fertilityStart = addDays(ovulation, -2)
    const fertilityEnd = addDays(ovulation, 2)

    if (day >= periodStart && day <= periodEnd) {
      return "period"
    }

    if (day.getTime() === ovulation.getTime()) {
      return "ovulation"
    }

    if (day >= fertilityStart && day <= fertilityEnd) {
      return "fertility"
    }

    return ""
  }

  return (
    <div style={{ marginTop: 20 }}>
      <Calendar
        onClickDay={handleDayClick}
        tileClassName={tileClassName}
      />

      {selectedDate && (
        <div style={{ marginTop: 20 }}>
          <p>Начало периода:</p>
          <strong>{selectedDate.toDateString()}</strong>

          <p style={{ marginTop: 10 }}>
            Следующий период:{" "}
            {addDays(selectedDate, 28).toDateString()}
          </p>
        </div>
      )}
    </div>
  )
}
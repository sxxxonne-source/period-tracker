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

  async function handleDayClick(value: Date) {

  const date = startOfDay(value)
  setSelectedDate(date)

  const userId = localStorage.getItem("telegram_user_id") || "test_user"

  const { data, error } = await supabase
    .from("periods")
    .insert({
      user_id: userId,
      start_date: date.toISOString().split("T")[0]
    })

  console.log("SUPABASE RESULT:", data, error)
}

  function tileClassName({ date }: { date: Date }) {

  if (!selectedDate) return ""

  const day = startOfDay(date)

  const periodStart = startOfDay(selectedDate)
  const periodEnd = addDays(periodStart, 4)

  const ovulation = addDays(periodStart, 14)

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
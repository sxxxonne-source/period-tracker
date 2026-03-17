"use client"

import { useState, useEffect } from "react"
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
  const [periods, setPeriods] = useState<any[]>([])
  const [pressTimer, setPressTimer] = useState<any>(null)
  const [duration, setDuration] = useState(5)

  useEffect(() => {
    loadPeriods()
  }, [])

  async function loadPeriods() {

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)

    if (data) {
      const mapped = data.map((p: any) => ({
        date: startOfDay(new Date(p.start_date)),
        duration: p.duration || 5
      }))
      setPeriods(mapped)
    }
  }

  async function handleDayClick(value: Date) {

    const date = startOfDay(value)
    const formatted = date.toISOString().split("T")[0]

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    const exists = periods.some(
      p => p.date.toISOString().split("T")[0] === formatted
    )

    if (exists) {
      alert("Этот период уже добавлен")
      return
    }

    setSelectedDate(date)

    await supabase
      .from("periods")
      .insert({
        user_id: userId,
        start_date: formatted,
        duration: duration
      })

    loadPeriods()
  }

  async function deletePeriod(date: Date) {

    const confirmDelete = confirm("Удалить этот период?")

    if (!confirmDelete) return

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    const formatted = date.toISOString().split("T")[0]

    await supabase
      .from("periods")
      .delete()
      .eq("user_id", userId)
      .eq("start_date", formatted)

    loadPeriods()
  }

  function handleMouseDown(date: Date) {

    const timer = setTimeout(() => {
      deletePeriod(date)
    }, 800)

    setPressTimer(timer)
  }

  function handleMouseUp() {
    if (pressTimer) clearTimeout(pressTimer)
  }

  function tileClassName({ date }: { date: Date }) {

    const day = startOfDay(date)

    for (const p of periods) {

      const start = p.date
      const duration = p.duration

      const periodEnd = addDays(start, duration - 1)
      const ovulation = addDays(start, 14)
      const fertilityStart = addDays(ovulation, -2)
      const fertilityEnd = addDays(ovulation, 2)

      if (day >= start && day <= periodEnd) {
        return "period"
      }

      if (day.getTime() === ovulation.getTime()) {
        return "ovulation"
      }

      if (day >= fertilityStart && day <= fertilityEnd) {
        return "fertility"
      }
    }

    return ""
  }

  return (
    <div style={{ marginTop: 20 }}>

      {/* выбор длительности */}
      <div style={{ marginBottom: 15 }}>
        <p>Длительность:</p>

        {[4,5,6,7].map(d => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            style={{
              marginRight: 8,
              padding: "6px 10px",
              borderRadius: 8,
              background: duration === d ? "#3b82f6" : "#1e293b",
              color: "white",
              border: "none"
            }}
          >
            {d} дн
          </button>
        ))}
      </div>

      <Calendar
        onClickDay={handleDayClick}
        tileClassName={tileClassName}
        tileContent={({ date }) => (
          <div
            onMouseDown={() => handleMouseDown(date)}
            onMouseUp={handleMouseUp}
            onTouchStart={() => handleMouseDown(date)}
            onTouchEnd={handleMouseUp}
            style={{ width: "100%", height: "100%" }}
          />
        )}
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
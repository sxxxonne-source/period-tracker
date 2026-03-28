"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function AddPeriod() {

  const router = useRouter()

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function handleSave() {

    if (!startDate || !endDate) {
      alert("Заполни обе даты")
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      alert("Дата окончания не может быть раньше начала")
      return
    }

    // считаем длительность
    const duration =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    await supabase
      .from("periods")
      .insert({
        user_id: userId,
        start_date: startDate,
        duration: duration
      })

    alert("Сохранено")

    router.push("/dashboard")
  }

  return (
  <>
    <main style={{ padding: 20, paddingBottom: 80 }}>

      {/* НАЗАД */}
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          marginBottom: 20,
          padding: "8px 12px",
          borderRadius: 8,
          border: "none",
          background: "#334155",
          color: "white"
        }}
      >
        ← Назад
      </button>

      <h1>Добавить период</h1>

      <p>Дата начала</p>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <p>Дата окончания</p>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <br /><br />

      <button
        onClick={handleSave}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "none",
          background: "#3b82f6",
          color: "white"
        }}
      >
        Сохранить
      </button>

    </main>

  </>
)
}
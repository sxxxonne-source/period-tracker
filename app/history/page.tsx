"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

type Period = {
  start_date: string
  duration: number
}

export default function HistoryPage() {

  const router = useRouter()
  const [periods, setPeriods] = useState<Period[]>([])

  useEffect(() => {
    loadPeriods()
  }, [])

  async function loadPeriods() {

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    const { data, error } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setPeriods(data)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  return (
    <main style={{ padding: 20 }}>

      {/* КНОПКА НАЗАД */}
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

      <h1>История</h1>

      {periods.length === 0 && (
        <p>Нет данных</p>
      )}

      {periods.map((p, index) => (
        <div
          key={index}
          style={{
            padding: 15,
            marginTop: 12,
            borderRadius: 12,
            background: "#1e293b",
            color: "white"
          }}
        >
          <div style={{ fontSize: 16, fontWeight: "bold" }}>
            📅 {formatDate(p.start_date)}
          </div>

          <div style={{ marginTop: 6, color: "#cbd5f5" }}>
            Длительность: {p.duration || 5} дней
          </div>
        </div>
      ))}
    </main>
  )
}
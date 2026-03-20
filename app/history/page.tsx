"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import BottomNav from "../components/BottomNav"

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
async function deletePeriod(startDate: string) {

  const confirmDelete = confirm("Удалить этот период?")

  if (!confirmDelete) return

  const userId =
    localStorage.getItem("telegram_user_id") || "test_user"

  await supabase
    .from("periods")
    .delete()
    .eq("user_id", userId)
    .eq("start_date", startDate)

  loadPeriods()
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
  <>
    <main style={{ padding: 20, paddingBottom: 80 }}>

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
      color: "white",
      position: "relative" // 👈 важно
    }}
  >
    {/* ❌ КНОПКА УДАЛЕНИЯ */}
    <button
      onClick={() => deletePeriod(p.start_date)}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "transparent",
        border: "none",
        color: "#f87171",
        fontSize: 18,
        cursor: "pointer"
      }}
    >
      ✕
    </button>

    <div style={{ fontSize: 16, fontWeight: "bold" }}>
      📅 {formatDate(p.start_date)}
    </div>

    <div style={{ marginTop: 6, color: "#cbd5f5" }}>
      Длительность: {p.duration || 5} дней
    </div>
  </div>
))}
    </main>

    {/* 👇 ВОТ ЭТОГО НЕ ХВАТАЛО */}
    <BottomNav />
  </>
)
}
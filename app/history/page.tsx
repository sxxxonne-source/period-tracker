"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Period = {
  start_date: string
}

export default function HistoryPage() {

  const [periods, setPeriods] = useState<Period[]>([])

  useEffect(() => {
    loadPeriods()
  }, [])

  async function loadPeriods() {

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    const { data, error } = await supabase
      .from("periods")
      .select("start_date")
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

  return (
    <main style={{ padding: 20 }}>
      <h1>История</h1>

      {periods.length === 0 && (
        <p>Нет данных</p>
      )}

      {periods.map((p, index) => (
        <div
          key={index}
          style={{
            padding: 10,
            marginTop: 10,
            borderRadius: 10,
            background: "#1e293b",
            color: "white"
          }}
        >
          📅 {new Date(p.start_date).toDateString()}
        </div>
      ))}
    </main>
  )
}
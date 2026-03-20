"use client"

import Link from "next/link"
import CycleCalendar from "../components/Calendar"
import { useEffect, useState } from "react"
import BottomNav from "../components/BottomNav"
import { t } from "../lib/translations"
import { supabase } from "../lib/supabase"

export default function Dashboard() {

  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")
  const [lang, setLang] = useState<"ru" | "en">("ru")

  const [nextPeriodDays, setNextPeriodDays] = useState<number | null>(null)
  const [ovulationDays, setOvulationDays] = useState<number | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem("lang")

    if (savedLang === "ru" || savedLang === "en") {
      setLang(savedLang)
    } else {
      setLang("ru")
    }

    setName(localStorage.getItem("user_name") || "Гость")
    setAvatar(localStorage.getItem("user_avatar") || "🌸")

    calculateCycle()
  }, [])

  function formatDays(days: number | null) {
    if (days === null) return "-"

    if (days <= 0) return lang === "ru" ? "Сегодня" : "Today"
    if (days === 1) return lang === "ru" ? "Завтра" : "Tomorrow"

    return `${days} ${lang === "ru" ? "дней" : "days"}`
  }

  async function calculateCycle() {

    const userId =
      localStorage.getItem("telegram_user_id") || "test_user"

    const { data } = await supabase
      .from("periods")
      .select("start_date")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(1)

    if (!data || data.length === 0) return

    const last = new Date(data[0].start_date)

    const next = new Date(last)
    next.setDate(next.getDate() + 28)

    const ovu = new Date(next)
    ovu.setDate(ovu.getDate() - 14)

    const today = new Date()

    const diffPeriod = Math.ceil(
      (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    const diffOvu = Math.ceil(
      (ovu.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    setNextPeriodDays(diffPeriod)
    setOvulationDays(diffOvu)
  }

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-[#0b1220] pb-20">

        <div className="w-[360px] rounded-3xl p-6 bg-gradient-to-b from-[#1f3b63] to-[#2b4f7c] text-white shadow-xl">

          {/* 👤 USER */}
          <div className="text-center mb-3">
            <div className="text-3xl">{avatar}</div>
            <h2 className="text-lg">Привет, {name}!</h2>
          </div>

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">

            <div></div>

            <h1 className="text-lg font-semibold">
              {t[lang].title}
            </h1>

            <button
              onClick={() => window.location.href = "/settings"}
              className="text-xl"
            >
              ⚙️
            </button>

          </div>

          {/* 📊 DATA */}
          <div className="text-sm text-center mb-4">
            <p>
              {t[lang].nextPeriod}:{" "}
              <b>{formatDays(nextPeriodDays)}</b>
            </p>

            <p>
              {t[lang].ovulation}:{" "}
              <b>{formatDays(ovulationDays)}</b>
            </p>
          </div>

          {/* 📅 CALENDAR */}
          <div className="bg-[#3e6ba5] rounded-xl p-3">
            <CycleCalendar />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between mt-5">

            <Link href="/add-period">
              <button className="bg-[#5c8fd6] px-4 py-2 rounded-xl">
                {t[lang].addPeriod}
              </button>
            </Link>

            <Link href="/history">
              <button className="bg-[#5c8fd6] px-4 py-2 rounded-xl">
                {t[lang].history}
              </button>
            </Link>

          </div>

        </div>

      </main>

      <BottomNav />
    </>
  )
}
"use client"

import Link from "next/link"
import CycleCalendar from "../components/Calendar"
import { useEffect, useState } from "react"

export default function Dashboard() {

  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "Гость")
    setAvatar(localStorage.getItem("user_avatar") || "🌸")
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b1220]">

      <div className="w-[360px] rounded-3xl p-6 bg-gradient-to-b from-[#1f3b63] to-[#2b4f7c] text-white shadow-xl">

        {/* 👇 ВСТАВИЛИ СЮДА */}
        <div className="text-center mb-3">
          <div className="text-3xl">{avatar}</div>
          <h2 className="text-lg">Привет, {name}!</h2>
        </div>

        <h1 className="text-center text-lg font-semibold mb-4">
          Отслеживание цикла
        </h1>

        <div className="text-sm text-center mb-4">
          <p>Следующая менструация: <b>7 дней</b></p>
          <p>Овуляция: <b>15 день</b></p>
        </div>

        <div className="bg-[#3e6ba5] rounded-xl p-3">
          <CycleCalendar />
        </div>

        <div className="flex justify-between mt-5">

          <Link href="/add-period">
            <button className="bg-[#5c8fd6] px-4 py-2 rounded-xl">
              Добавить период
            </button>
          </Link>

          <Link href="/history">
            <button className="bg-[#5c8fd6] px-4 py-2 rounded-xl">
              История
            </button>
          </Link>

        </div>

      </div>

    </main>
  )
}
"use client"

import { useEffect } from "react"
import Link from "next/link"
import CycleCalendar from "./components/Calendar"

export default function Home() {

  useEffect(() => {

    const tg = (window as any).Telegram?.WebApp

    if (tg) {
      tg.ready()

      const user = tg.initDataUnsafe?.user

      console.log("Telegram user:", user)
    }

  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Отслеживание цикла</h1>

      <p>Следующая менструация: 7 дней</p>
      <p>Овуляция: 15 дней</p>

      <CycleCalendar />

      <br />

      <Link href="/add-period">
        <button>Добавить период</button>
      </Link>

      <br /><br />

      <Link href="/history">
        <button>История</button>
      </Link>
    </main>
  )
}
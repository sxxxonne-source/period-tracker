"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {

  const router = useRouter()

  useEffect(() => {

    const tg = (window as any).Telegram?.WebApp

    if (tg) {

      tg.ready()

      const user = tg.initDataUnsafe?.user

      if (user) {
        localStorage.setItem("telegram_user_id", user.id)
      }

    }

    router.push("/dashboard")

  }, [])

  return (
    <main style={{ padding: 20 }}>
      <p>Загрузка...</p>
    </main>
  )
}
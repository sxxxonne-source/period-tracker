"use client"

import LoadingScreen from "./components/LoadingScreen"
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

    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)

  }, [])

  return <LoadingScreen />
}
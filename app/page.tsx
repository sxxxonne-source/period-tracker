"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingScreen from "./components/LoadingScreen"

export default function Home() {
  const [showLoading, setShowLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 1. Показываем лоадер ровно 3 секунды для красоты и инициализации
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // 2. Когда лоадер закончил работу, делаем редирект на welcome
  useEffect(() => {
    if (!showLoading) {
      router.push("/welcome")
    }
  }, [showLoading, router])

  // 3. Пока идет загрузка, рендерим наш красивый экран Luna
  if (showLoading) {
    return <LoadingScreen />
  }

  // Возвращаем null или пустой div, так как в этот момент уже срабатывает router.push
  return null
}
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {

  const router = useRouter()

  useEffect(() => {

    // ❗ ДЛЯ ТЕСТА — ВСЕГДА показываем welcome
    router.push("/welcome")

  }, [])

  return null
}
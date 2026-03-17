"use client"

import { useRouter } from "next/navigation"

export default function WelcomePage() {

  const router = useRouter()

  function handleContinue() {

    localStorage.setItem("has_seen_welcome", "true")

    router.push("/dashboard")
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        textAlign: "center"
      }}
    >

      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        Добро пожаловать!
      </h1>

      <p style={{ marginBottom: 30, color: "#94a3b8" }}>
        Давайте познакомимся с вашим циклом
      </p>

      {/* аватар (пока заглушка) */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "#1e293b",
          marginBottom: 30
        }}
      />

      <button
        onClick={handleContinue}
        style={{
          padding: "12px 20px",
          borderRadius: 12,
          background: "#3b82f6",
          color: "white",
          border: "none"
        }}
      >
        Начать
      </button>

    </main>
  )
}
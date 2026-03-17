"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const avatars = ["🌸", "🌙", "💧", "💗", "🦋", "🌷"]

export default function WelcomePage() {

  const router = useRouter()

  const [name, setName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("🌸")

  function handleContinue() {

    if (!name) {
      alert("Введите имя")
      return
    }

    localStorage.setItem("has_seen_welcome", "true")
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar", selectedAvatar)

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

      <p style={{ marginBottom: 20, color: "#94a3b8" }}>
        Давайте познакомимся с вашим циклом
      </p>

      {/* имя */}
      <input
        placeholder="Введите имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: 10,
          borderRadius: 10,
          marginBottom: 20,
          border: "none",
          width: 200
        }}
      />

      {/* аватар */}
      <div style={{ marginBottom: 20 }}>
        <p>Выберите аватар:</p>

        <div style={{ marginTop: 10 }}>
          {avatars.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAvatar(a)}
              style={{
                fontSize: 24,
                margin: 5,
                padding: 10,
                borderRadius: 10,
                border:
                  selectedAvatar === a
                    ? "2px solid #3b82f6"
                    : "none",
                background: "#1e293b"
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

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
        Продолжить
      </button>

    </main>
  )
}
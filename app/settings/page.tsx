"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "../components/BottomNav"

const avatars = ["🌸", "🌙", "💧", "💗", "🦋", "🌷"]

export default function SettingsPage() {

  const router = useRouter()

  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "")
    setAvatar(localStorage.getItem("user_avatar") || "🌸")
  }, [])

  function handleSave() {
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar", avatar)

    alert("Сохранено ✅")
    router.push("/dashboard")
  }

  return (
    <>
      <main style={{ padding: 20, paddingBottom: 80 }}>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            marginBottom: 20,
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "#334155",
            color: "white"
          }}
        >
          ← Назад
        </button>

        <h1>Настройки</h1>

        {/* имя */}
        <p style={{ marginTop: 20 }}>Имя</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "none"
          }}
        />

        {/* аватар */}
        <p style={{ marginTop: 20 }}>Аватар</p>

        <div style={{ marginTop: 10 }}>
          {avatars.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              style={{
                fontSize: 24,
                margin: 5,
                padding: 10,
                borderRadius: 10,
                border:
                  avatar === a
                    ? "2px solid #3b82f6"
                    : "none",
                background: "#1e293b"
              }}
            >
              {a}
            </button>
          ))}
        </div>

        <br />

        <button
          onClick={handleSave}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: "#3b82f6",
            color: "white"
          }}
        >
          Сохранить
        </button>

      </main>

      <BottomNav />
    </>
  )
}
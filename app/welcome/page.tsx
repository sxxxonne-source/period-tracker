"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function WelcomePage() {
  const router = useRouter()
  
  // Состояния для данных
  const [name, setName] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [cycleLength, setCycleLength] = useState(28)
  const [lastPeriod, setLastPeriod] = useState("2026-03-12")

  useEffect(() => {
    // Получаем данные из Telegram
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.expand() // Раскрываем на всё окно
      const user = tg.initDataUnsafe?.user
      if (user) {
        setName(user.first_name || "")
        setPhotoUrl(user.photo_url || null) // URL аватара
      }
    }
  }, [])

  function handleContinue() {
    if (!name) return alert("Введите имя")
    
    localStorage.setItem("user_name", name)
    localStorage.setItem("cycle_length", cycleLength.toString())
    localStorage.setItem("last_period", lastPeriod)
    
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0e1a2b] text-white">
      {/* Контейнер-телефон (как в Figma) */}
      <div className="w-full max-w-[402px] flex flex-col items-center">
        
        <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
        <p className="text-gray-400 mb-8 text-sm">Давайте познакомимся с вашим циклом</p>

        {/* АВАТАР ПОЛЬЗОВАТЕЛЯ */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-2 border-blue-400/30 overflow-hidden bg-blue-900/20 flex items-center justify-center shadow-[0_0_20px_rgba(100,149,237,0.3)]">
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🌙</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-[#0e1a2b]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>

        {/* ПОЛЕ ИМЕНИ */}
        <input
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#1e293b] border-none rounded-2xl py-4 px-6 mb-8 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />

        {/* НАСТРОЙКА ЦИКЛА (Как на скринкасте) */}
        <div className="w-full space-y-6">
          <div className="bg-[#1e293b]/50 p-6 rounded-[32px] border border-white/5">
            <p className="text-sm font-medium mb-4">Продолжительность цикла</p>
            <div className="flex items-center justify-between bg-[#0e1a2b] rounded-2xl p-2 border border-white/10">
              <button 
                onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}
                className="w-12 h-12 flex items-center justify-center text-2xl font-light hover:text-blue-400"
              >—</button>
              <span className="text-xl font-semibold text-blue-400">{cycleLength} Дней</span>
              <button 
                onClick={() => setCycleLength(Math.min(35, cycleLength + 1))}
                className="w-12 h-12 flex items-center justify-center text-2xl font-light hover:text-blue-400"
              >+</button>
            </div>
          </div>

          <div className="bg-[#1e293b]/50 p-6 rounded-[32px] border border-white/5">
            <p className="text-sm font-medium mb-4 text-left">Последний период</p>
            <div className="relative">
              <input 
                type="date" 
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="w-full bg-[#0e1a2b] border border-white/10 rounded-2xl py-4 px-6 text-blue-400 outline-none appearance-none"
              />
            </div>
          </div>
        </div>

        {/* КНОПКА ПРОДОЛЖИТЬ */}
        <button
          onClick={handleContinue}
          className="w-full mt-10 py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform"
        >
          Продолжить
        </button>

      </div>
    </main>
  )
}
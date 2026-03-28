"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const AVAILABLE_AVATARS = ["🌸", "🌙", "💧", "💗", "🦋", "🌷", "⭐", "✨"]

export default function SettingsPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")
  const [lang, setLang] = useState("ru")

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "")
    setAvatar(localStorage.getItem("user_avatar_emoji") || "🌸")
    setLang(localStorage.getItem("lang") || "ru")
  }, [])

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  function handleSave() {
    triggerHaptic('medium');
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar_emoji", avatar)
    localStorage.setItem("lang", lang)

    // Используем нативное уведомление Telegram вместо alert
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert("Настройки сохранены ✨", () => {
        router.push("/dashboard");
      });
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-6 pb-24">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { triggerHaptic(); router.push("/dashboard"); }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e293b] border border-white/5 active:scale-90 transition-transform"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-xl font-bold">Настройки</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-[402px] mx-auto space-y-8">
        
        {/* СЕКЦИЯ: ИМЯ */}
        <div className="space-y-3">
          <label className="text-xs text-gray-400 uppercase tracking-widest ml-2">Ваше имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-colors shadow-inner"
            placeholder="Введите имя..."
          />
        </div>

        {/* СЕКЦИЯ: АВАТАР */}
        <div className="space-y-3">
          <label className="text-xs text-gray-400 uppercase tracking-widest ml-2">Аватар (Эмодзи)</label>
          <div className="grid grid-cols-4 gap-3 bg-[#1e293b]/30 p-4 rounded-[24px] border border-white/5">
            {AVAILABLE_AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => { setAvatar(a); triggerHaptic('light'); }}
                className={`text-2xl h-14 flex items-center justify-center rounded-xl transition-all ${
                  avatar === a 
                    ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105" 
                    : "bg-[#0e1a2b]/50 hover:bg-[#0e1a2b]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* СЕКЦИЯ: ЯЗЫК */}
        <div className="space-y-3">
          <label className="text-xs text-gray-400 uppercase tracking-widest ml-2">Язык интерфейса</label>
          <div className="flex p-1 bg-[#1e293b]/50 rounded-2xl border border-white/5">
            <button
              onClick={() => { setLang("ru"); triggerHaptic('light'); }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                lang === "ru" ? "bg-blue-600 text-white" : "text-gray-400"
              }`}
            >
              🇷🇺 Русский
            </button>
            <button
              onClick={() => { setLang("en"); triggerHaptic('light'); }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                lang === "en" ? "bg-blue-600 text-white" : "text-gray-400"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* КНОПКА СОХРАНИТЬ */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            className="w-full py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform"
          >
            Сохранить изменения
          </button>
        </div>

      </div>

    </main>
  )
}
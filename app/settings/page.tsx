"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const AVAILABLE_AVATARS = ["🌸", "🌙", "💧", "💗", "🦋", "🌷", "⭐", "✨"]

export default function SettingsPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")
  const [lang, setLang] = useState("ru")
  const [cycleLength, setCycleLength] = useState(28)
  const [periodDuration, setPeriodDuration] = useState(5)
  const [birthYear, setBirthYear] = useState(2000)
  
  // Состояния для уведомлений
  const [isPremium, setIsPremium] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setName(localStorage.getItem("user_name") || "")
      setAvatar(localStorage.getItem("user_avatar_emoji") || "🌸")
      setLang(localStorage.getItem("lang") || "ru")
      setCycleLength(Number(localStorage.getItem("cycle_length")) || 28)
      setPeriodDuration(Number(localStorage.getItem("period_duration")) || 5)
      setBirthYear(Number(localStorage.getItem("birth_year")) || 2000)
      
      // Проверка подписки
      const premiumStatus = localStorage.getItem("user_subscription") === "premium"
      setIsPremium(premiumStatus)
      setNotificationsEnabled(localStorage.getItem("notifications_enabled") === "true")
    }
  }, [])

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  const toggleNotifications = () => {
    if (!isPremium) {
      triggerHaptic('heavy');
      const tg = (window as any).Telegram?.WebApp;
      tg?.showConfirm?.("Уведомления доступны только в Premium версии. Хотите узнать больше?", (confirmed: boolean) => {
        if (confirmed) router.push("/premium"); // Или куда ведет ссылка на оплату
      });
      return;
    }
    triggerHaptic('medium');
    setNotificationsEnabled(!notificationsEnabled);
  };

  function handleSave() {
    triggerHaptic('medium');
    
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar_emoji", avatar)
    localStorage.setItem("lang", lang)
    localStorage.setItem("cycle_length", cycleLength.toString())
    localStorage.setItem("period_duration", periodDuration.toString())
    localStorage.setItem("birth_year", birthYear.toString())
    localStorage.setItem("notifications_enabled", notificationsEnabled.toString())

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert("Настройки сохранены ✨", () => router.push("/dashboard"));
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-6 pb-24 overflow-y-auto scrollbar-hide">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 max-w-[402px] mx-auto">
        <button
          onClick={() => { triggerHaptic('light'); router.push("/dashboard"); }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e293b] border border-white/5 active:scale-90 transition-transform"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-xl font-bold">Настройки</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-[402px] mx-auto space-y-6">
        
        {/* СЕКЦИЯ: УВЕДОМЛЕНИЯ (PREMIUM) */}
        <div className={`p-5 rounded-[28px] border transition-all ${isPremium ? 'bg-blue-600/10 border-blue-500/30' : 'bg-gray-800/20 border-white/5 opacity-80'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="text-xs uppercase tracking-widest font-bold">Уведомления</h3>
              {!isPremium && <span className="bg-amber-400 text-[#0e1a2b] text-[8px] px-1.5 py-0.5 rounded font-black uppercase">PRO</span>}
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled && isPremium ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled && isPremium ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400">Напоминания о начале цикла и овуляции</p>
        </div>

        {/* СЕКЦИЯ: ОСНОВНОЕ */}
        <div className="space-y-4 bg-[#1e293b]/20 p-5 rounded-[28px] border border-white/5">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 font-bold">Ваше имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0e1a2b] border border-white/5 rounded-2xl py-3.5 px-6 outline-none focus:ring-1 focus:ring-blue-500 transition-all text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 font-bold">Аватар</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAvatar(a); triggerHaptic('light'); }}
                  className={`text-xl h-12 flex items-center justify-center rounded-xl transition-all ${avatar === a ? "bg-blue-600 shadow-lg scale-105" : "bg-[#0e1a2b] border border-white/5"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* СЕКЦИЯ: ЦИКЛ */}
        <div className="space-y-4 bg-[#1e293b]/20 p-5 rounded-[28px] border border-white/5">
          <h3 className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Параметры цикла</h3>
          <div className="flex gap-3">
             {/* Повторяем логику счетчиков из предыдущего шага */}
             <div className="flex-1 space-y-2 text-center">
                <label className="text-[9px] text-gray-500 uppercase block">Цикл</label>
                <div className="flex items-center justify-between bg-[#0e1a2b] rounded-xl p-1 border border-white/5">
                  <button onClick={() => { setCycleLength(Math.max(21, cycleLength - 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">—</button>
                  <span className="text-sm font-bold">{cycleLength}</span>
                  <button onClick={() => { setCycleLength(Math.min(45, cycleLength + 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">+</button>
                </div>
             </div>
             <div className="flex-1 space-y-2 text-center">
                <label className="text-[9px] text-gray-500 uppercase block">Месячные</label>
                <div className="flex items-center justify-between bg-[#0e1a2b] rounded-xl p-1 border border-white/5">
                  <button onClick={() => { setPeriodDuration(Math.max(2, periodDuration - 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">—</button>
                  <span className="text-sm font-bold">{periodDuration}</span>
                  <button onClick={() => { setPeriodDuration(Math.min(10, periodDuration + 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">+</button>
                </div>
             </div>
          </div>
        </div>

        {/* КНОПКА СОХРАНИТЬ */}
        <button
          onClick={handleSave}
          className="w-full py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform"
        >
          Сохранить всё
        </button>

      </div>
    </main>
  )
}
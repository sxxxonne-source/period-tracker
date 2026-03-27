"use client"

import Link from "next/link"
import CycleCalendar from "../components/Calendar"
import { useEffect, useState } from "react"
import BottomNav from "../components/BottomNav"
import { t } from "../lib/translations"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")
  const [lang, setLang] = useState<"ru" | "en">("ru")
  const [nextPeriodDays, setNextPeriodDays] = useState<number | null>(null)
  const [ovulationDays, setOvulationDays] = useState<number | null>(null)

  useEffect(() => {
    // Подтягиваем данные из localStorage
    const savedLang = localStorage.getItem("lang") || "ru"
    setLang(savedLang as "ru" | "en")
    
    setName(localStorage.getItem("user_name") || "Гость")
    setAvatar(localStorage.getItem("user_avatar_emoji") || "🌸")

    calculateCycle()
  }, [])

  // Функция вибрации для кнопок
  const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  async function calculateCycle() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data } = await supabase
      .from("periods")
      .select("start_date")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(1)

    // Если данных в БД еще нет, берем дату из Welcome (localStorage)
    let lastDateStr = data?.[0]?.start_date || localStorage.getItem("last_period")
    if (!lastDateStr) return

    const last = new Date(lastDateStr)
    const cycleLen = Number(localStorage.getItem("cycle_length")) || 28

    const next = new Date(last)
    next.setDate(next.getDate() + cycleLen)

    const ovu = new Date(next)
    ovu.setDate(ovu.getDate() - 14)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffPeriod = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const diffOvu = Math.ceil((ovu.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    setNextPeriodDays(diffPeriod)
    setOvulationDays(diffOvu)
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white font-sans overflow-x-hidden pb-24">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ (Header) */}
      <div className="w-full px-6 pt-8 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-900/30 border border-blue-400/20 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(100,149,237,0.2)]">
            {avatar}
          </div>
          <div>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Привет,</p>
            <h2 className="text-xl font-bold leading-tight">{name}</h2>
          </div>
        </div>
        
        <button 
          onClick={() => { triggerHaptic(); window.location.href = "/settings"; }}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-xl active:scale-90 transition-transform"
        >
          ⚙️
        </button>
      </div>

      <div className="px-6 max-w-[402px] mx-auto space-y-6">
        
        {/* КАРТОЧКИ ПРОГНОЗА (Stats) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1e293b]/50 p-4 rounded-3xl border border-white/5 backdrop-blur-sm shadow-inner">
            <p className="text-[10px] text-gray-400 uppercase mb-1">Менструация</p>
            <p className="text-lg font-bold text-blue-400">
              {nextPeriodDays !== null ? `${nextPeriodDays} дн.` : '...'}
            </p>
          </div>
          <div className="bg-[#1e293b]/50 p-4 rounded-3xl border border-white/5 backdrop-blur-sm shadow-inner">
            <p className="text-[10px] text-gray-400 uppercase mb-1">Овуляция</p>
            <p className="text-lg font-bold text-pink-400">
              {ovulationDays !== null ? `${ovulationDays} дн.` : '...'}
            </p>
          </div>
        </div>

        {/* ЗАГОЛОВОК КАЛЕНДАРЯ */}
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-semibold tracking-tight">Отслеживание цикла</h3>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">МАРТ 2026</span>
        </div>

        {/* ОСНОВНОЙ КАЛЕНДАРЬ */}
        <div className="bg-[#1e293b]/40 rounded-[32px] p-2 border border-white/5 shadow-2xl backdrop-blur-md">
          <CycleCalendar />
        </div>

        {/* КНОПКИ ДЕЙСТВИЯ (Action Buttons) */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Link href="/add-period" className="w-full">
            <button 
              onClick={() => triggerHaptic('medium')}
              className="w-full py-4 rounded-2xl bg-blue-600 font-bold text-sm shadow-[0_8px_15px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
            >
              Добавить период
            </button>
          </Link>

          <Link href="/history" className="w-full">
            <button 
              onClick={() => triggerHaptic()}
              className="w-full py-4 rounded-2xl bg-[#1e293b] border border-white/10 font-bold text-sm hover:bg-[#2a3a52] active:scale-95 transition-all"
            >
              История
            </button>
          </Link>
        </div>

      </div>

      <BottomNav />
    </main>
  )
}
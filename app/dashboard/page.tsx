"use client"

import Link from "next/link"
import CycleCalendar from "../components/Calendar"
import { useEffect, useState } from "react"
import { t } from "../lib/translations"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")
  const [lang, setLang] = useState<"ru" | "en">("ru")
  const [nextPeriodDays, setNextPeriodDays] = useState<number | null>(null)
  const [ovulationDays, setOvulationDays] = useState<number | null>(null)

  useEffect(() => {
    // Безопасное чтение только после монтирования в браузере
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("lang") || "ru"
      setLang(savedLang as "ru" | "en")
      
      setName(localStorage.getItem("user_name") || "Гость")
      setAvatar(localStorage.getItem("user_avatar_emoji") || "🌸")

      calculateCycle()
    }
  }, [])

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
    }
  };

  const handleQuickAdd = async () => {
    if (typeof window === "undefined") return;
    
    const tg = (window as any).Telegram?.WebApp;
    const today = new Date().toISOString().split('T')[0];
    const userId = localStorage.getItem("telegram_user_id") || "test_user";

    if (tg?.showPopup) {
      triggerHaptic('medium');
      tg.showPopup({
        title: 'Luna Инфо',
        message: 'Месячные начались сегодня?',
        buttons: [
          { id: 'yes', type: 'default', text: 'Да, отметить' },
          { id: 'cancel', type: 'destructive', text: 'Отмена' }
        ]
      }, async (buttonId: string) => {
        if (buttonId === 'yes') {
          triggerHaptic('heavy');
          const savedCycleLen = localStorage.getItem("cycle_length");
          const duration = Number(savedCycleLen) > 10 ? 5 : Number(savedCycleLen);
          
          await supabase.from("periods").insert({
            user_id: userId,
            start_date: today,
            duration: duration || 5
          });
          
          calculateCycle();
          window.location.reload(); 
        }
      });
    } else {
      if (confirm("Месячные начались сегодня?")) {
        await supabase.from("periods").insert({ user_id: userId, start_date: today, duration: 5 });
        window.location.reload();
      }
    }
  };

  async function calculateCycle() {
    if (typeof window === "undefined") return;

    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data } = await supabase
      .from("periods")
      .select("start_date")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(1)

    // Проверка на наличие данных в БД или в localStorage
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
    <main className="h-screen bg-[#0e1a2b] text-white font-sans overflow-hidden flex flex-col pb-6">
      
      <div className="w-full px-6 pt-6 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-900/30 border border-blue-400/20 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(100,149,237,0.2)]">
            {avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">Привет!</h2>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">{name}</p>
          </div>
        </div>
        
        <button 
          onClick={() => { triggerHaptic(); window.location.href = "/settings"; }}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-xl active:scale-90 transition-transform"
        >
          ⚙️
        </button>
      </div>

      <div className="px-6 flex-1 flex flex-col justify-between max-w-[402px] mx-auto w-full">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e293b]/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner text-center">
            <p className="text-[9px] text-gray-400 uppercase mb-1">Менструация</p>
            <p className="text-md font-bold text-blue-400">
              {nextPeriodDays !== null ? (nextPeriodDays <= 0 ? "Сегодня" : `${nextPeriodDays} дн.`) : '...'}
            </p>
          </div>
          <div className="bg-[#1e293b]/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner text-center">
            <p className="text-[9px] text-gray-400 uppercase mb-1">Овуляция</p>
            <p className="text-md font-bold text-pink-400">
              {ovulationDays !== null ? (ovulationDays <= 0 ? "Сегодня" : `${ovulationDays} дн.`) : '...'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center my-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-semibold tracking-tight">Отслеживание цикла</h3>
            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">
              {new Date().toLocaleString('ru', { month: 'long', year: 'numeric' }).toUpperCase()}
            </span>
          </div>

          <div className="bg-[#1e293b]/40 rounded-[24px] p-1 border border-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
            <CycleCalendar />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <button 
            onClick={handleQuickAdd}
            className="w-full py-3.5 rounded-xl bg-blue-600 font-bold text-xs shadow-lg active:scale-95 transition-all text-white"
          >
            Отметить начало
          </button>

          <Link href="/history" className="w-full">
            <button 
              onClick={() => triggerHaptic()}
              className="w-full py-3.5 rounded-xl bg-[#1e293b] border border-white/10 font-bold text-xs hover:bg-[#2a3a52] active:scale-95 transition-all text-white"
            >
              История
            </button>
          </Link>
        </div>

      </div>

    </main>
  )
}
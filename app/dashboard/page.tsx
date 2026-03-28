"use client"

import Link from "next/link"
import CycleCalendar from "../components/Calendar"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🌸")
  const [isPremium, setIsPremium] = useState(false)
  const [nextPeriodDays, setNextPeriodDays] = useState<number | null>(null)
  const [daysUntilEnd, setDaysUntilEnd] = useState<number | null>(null)
  const [ovulationDays, setOvulationDays] = useState<number | null>(null)
  
  // Состояния для модального окна действий
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setName(localStorage.getItem("user_name") || "Гость")
      setAvatar(localStorage.getItem("user_avatar_emoji") || "🌸")
      setIsPremium(localStorage.getItem("user_subscription") === "premium")
      calculateCycle()
    }
  }, [])

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
    }
  };

  // Универсальная функция добавления событий (Секс, Настроение)
  const handleAddEvent = async (type: string, value: string) => {
    if (!isPremium) {
      const tg = (window as any).Telegram?.WebApp;
      triggerHaptic('medium');
      if (tg?.showAlert) {
        tg.showAlert("🌟 Эта функция доступна только в Luna Premium!");
      } else {
        alert("Эта функция доступна только в Premium подписке");
      }
      return;
    }

    const userId = localStorage.getItem("telegram_user_id") || "test_user";
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from("events").insert({
      user_id: userId,
      date: today,
      type: type,
      value: value
    });

    if (!error) {
      triggerHaptic('heavy');
      setIsActionModalOpen(false);
      // Перезагружаем страницу или обновляем календарь локально
      window.location.reload(); 
    }
  };

  const handleQuickAdd = async () => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    const today = new Date().toISOString().split('T')[0];
    const userId = localStorage.getItem("telegram_user_id") || "test_user";
    const savedDuration = Number(localStorage.getItem("period_duration")) || 5;

    if (tg?.showPopup) {
      triggerHaptic('medium');
      tg.showPopup({
        title: 'Luna Инфо',
        message: `Отметить начало месячных сегодня? (${savedDuration} дн.)`,
        buttons: [
          { id: 'yes', type: 'default', text: 'Да, отметить' },
          { id: 'cancel', type: 'destructive', text: 'Отмена' }
        ]
      }, async (buttonId: string) => {
        if (buttonId === 'yes') {
          triggerHaptic('heavy');
          await supabase.from("periods").insert({
            user_id: userId,
            start_date: today,
            duration: savedDuration
          });
          window.location.reload(); 
        }
      });
    } else {
      if (confirm(`Начать сегодня (${savedDuration} дн.)?`)) {
        await supabase.from("periods").insert({ 
          user_id: userId, 
          start_date: today, 
          duration: savedDuration 
        });
        window.location.reload();
      }
    }
  };

  async function calculateCycle() {
    if (typeof window === "undefined") return;
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(1)

    let lastDateStr = data?.[0]?.start_date || localStorage.getItem("last_period")
    let duration = data?.[0]?.duration || Number(localStorage.getItem("period_duration")) || 5
    if (!lastDateStr) return

    const lastStart = new Date(lastDateStr)
    const cycleLen = Number(localStorage.getItem("cycle_length")) || 28
    const today = new Date();
    today.setHours(0, 0, 0, 0)

    const lastEnd = new Date(lastStart)
    lastEnd.setDate(lastStart.getDate() + (duration - 1))
    const nextStart = new Date(lastStart)
    nextStart.setDate(lastStart.getDate() + cycleLen)

    if (today >= lastStart && today <= lastEnd) {
      const diffEnd = Math.ceil((lastEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setDaysUntilEnd(diffEnd + 1)
      setNextPeriodDays(null)
    } else {
      const diffNext = Math.ceil((nextStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setNextPeriodDays(diffNext)
      setDaysUntilEnd(null)
    }

    const ovu = new Date(nextStart)
    ovu.setDate(ovu.getDate() - 14)
    setOvulationDays(Math.ceil((ovu.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  }

  return (
    <main className="h-screen bg-[#0e1a2b] text-white font-sans overflow-hidden flex flex-col pb-6 relative">
      
      {/* HEADER */}
      <div className="w-full px-6 pt-6 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-blue-900/30 border border-blue-400/20 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(100,149,237,0.2)]">
              {avatar}
            </div>
            {isPremium && <div className="absolute -top-1 -right-1 text-[12px] drop-shadow-md">👑</div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-bold leading-tight">Привет!</h2>
              <div className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider border ${
                isPremium ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500" : "bg-white/5 border-white/10 text-gray-500"
              }`}>
                {isPremium ? "Премиум" : "Базовая"}
              </div>
            </div>
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

      <div className="px-6 flex-1 flex flex-col justify-between max-w-[402px] mx-auto w-full relative">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e293b]/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner text-center">
            <p className="text-[9px] text-gray-400 uppercase mb-1">
              {daysUntilEnd !== null ? "До конца" : "Менструация"}
            </p>
            <p className="text-md font-bold text-blue-400">
              {daysUntilEnd !== null 
                ? `${daysUntilEnd} дн.` 
                : (nextPeriodDays !== null ? (nextPeriodDays <= 0 ? "Сегодня" : `${nextPeriodDays} дн.`) : '...')}
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

        {/* Кнопка ПЛЮС (FAB) */}
        <button 
          onClick={() => { triggerHaptic('medium'); setIsActionModalOpen(true); }}
          className="absolute -right-2 bottom-20 w-14 h-14 bg-pink-600 rounded-full shadow-[0_0_20px_rgba(219,39,119,0.4)] flex items-center justify-center text-3xl z-40 active:scale-90 transition-transform border-2 border-white/10"
        >
          +
        </button>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДЕЙСТВИЙ */}
      {isActionModalOpen && (
        <div 
          className="fixed inset-0 bg-[#0e1a2b]/90 backdrop-blur-md z-[100] flex flex-col justify-center items-center px-6"
          onClick={() => setIsActionModalOpen(false)}
        >
          <div 
            className="w-full max-w-[300px] bg-[#1e293b] rounded-[32px] p-6 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-bold text-xl mb-6">Добавить отметку</h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleAddEvent('sex', 'protected')}
                className="w-full py-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                ❤️ Секс (ПА)
              </button>

              <button 
                onClick={() => handleAddEvent('mood', 'happy')}
                className="w-full py-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                😊 Настроение: Супер
              </button>

              <button 
                onClick={() => handleAddEvent('mood', 'sad')}
                className="w-full py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                😔 Настроение: Грустно
              </button>
            </div>

            <button 
              onClick={() => setIsActionModalOpen(false)}
              className="w-full mt-6 text-gray-500 font-medium text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
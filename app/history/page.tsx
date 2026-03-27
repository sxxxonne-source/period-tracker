"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import BottomNav from "../components/BottomNav"

type Period = {
  start_date: string
  duration: number
}

export default function HistoryPage() {
  const router = useRouter()
  const [periods, setPeriods] = useState<Period[]>([])

  useEffect(() => {
    loadPeriods()
  }, [])

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  async function loadPeriods() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data, error } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (error) {
      console.error(error)
      return
    }
    if (data) setPeriods(data)
  }

  async function deletePeriod(startDate: string) {
    const tg = (window as any).Telegram?.WebApp;
    triggerHaptic('medium');

    const performDelete = async () => {
      const userId = localStorage.getItem("telegram_user_id") || "test_user"
      await supabase.from("periods").delete().eq("user_id", userId).eq("start_date", startDate)
      triggerHaptic('heavy');
      loadPeriods()
    }

    // Используем нативный Popup Telegram, если доступен
    if (tg?.showPopup) {
      tg.showPopup({
        title: 'Удаление',
        message: 'Вы уверены, что хотите удалить этот цикл из истории?',
        buttons: [
          { id: 'delete', type: 'destructive', text: 'Удалить' },
          { id: 'cancel', type: 'cancel', text: 'Отмена' }
        ]
      }, (buttonId: string) => {
        if (buttonId === 'delete') performDelete();
      });
    } else {
      if (confirm("Удалить этот период?")) performDelete();
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  // Расчет длины цикла (разница между текущим и предыдущим)
  const getCycleLength = (index: number) => {
    if (index === periods.length - 1) return null;
    const current = new Date(periods[index].start_date);
    const prev = new Date(periods[index + 1].start_date);
    const diffTime = Math.abs(current.getTime() - prev.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
        <h1 className="text-xl font-bold">История циклов</h1>
        <div className="w-10"></div> {/* Для центровки заголовка */}
      </div>

      {periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 opacity-50 text-center">
          <span className="text-6xl mb-4">🌙</span>
          <p>История пока пуста</p>
        </div>
      ) : (
        <div className="space-y-4">
          {periods.map((p, index) => {
            const cycleDays = getCycleLength(index);
            return (
              <div
                key={index}
                className="relative bg-[#1e293b]/50 border border-white/5 p-5 rounded-[24px] backdrop-blur-sm shadow-xl animate-fade-in"
              >
                <button
                  onClick={() => deletePeriod(p.start_date)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-red-400/50 hover:text-red-400 active:scale-125 transition-all"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    📅
                  </div>
                  <div>
                    <div className="font-bold text-lg">{formatDate(p.start_date)}</div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Начало цикла</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Длительность</p>
                    <p className="text-sm font-semibold text-blue-300">{p.duration || 5} дней</p>
                  </div>
                  {cycleDays && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Весь цикл</p>
                      <p className="text-sm font-semibold text-purple-300">{cycleDays} дней</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </main>
  )
}
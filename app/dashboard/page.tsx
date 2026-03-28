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
  const [ovulationDays, setOvulationDays] = useState<number | null>(null)
  
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false) 

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

  const togglePremiumTest = () => {
    const newStatus = !isPremium;
    setIsPremium(newStatus);
    localStorage.setItem("user_subscription", newStatus ? "premium" : "base");
    triggerHaptic('heavy');
    const tg = (window as any).Telegram?.WebApp;
    tg?.showAlert?.(`Тестовый режим: подписка ${newStatus ? 'АКТИВИРОВАНА' : 'ДЕАКТИВИРОВАНА'}`);
  };

  const savePeriodToDb = async () => {
    const today = new Date().toISOString().split('T')[0];
    const userId = localStorage.getItem("telegram_user_id") || "test_user";
    // Используем сохраненную длительность из настроек
    const savedDuration = Number(localStorage.getItem("period_duration")) || 5;

    const { error } = await supabase.from("periods").insert({ 
      user_id: userId, 
      start_date: today, 
      duration: savedDuration 
    });

    if (!error) {
      triggerHaptic('medium');
      // После сохранения пересчитываем цикл
      calculateCycle();
      window.location.reload(); 
    }
  };

  const handleQuickAdd = () => {
    const tg = (window as any).Telegram?.WebApp;
    triggerHaptic('medium');

    if (tg && tg.showPopup) {
      tg.showPopup({
        title: 'Luna Инфо',
        message: `Отметить начало менструации сегодня?`,
        buttons: [
          { id: 'yes', type: 'default', text: 'Да, отметить' },
          { id: 'cancel', type: 'destructive', text: 'Отмена' }
        ]
      }, (buttonId: string) => {
        if (buttonId === 'yes') savePeriodToDb();
      });
    } else {
      if (window.confirm("Отметить начало менструации сегодня?")) savePeriodToDb();
    }
  };

  const handleAddEvent = async (type: string, value: string) => {
    if (!isPremium) {
      triggerHaptic('medium');
      const tg = (window as any).Telegram?.WebApp;
      tg?.showAlert?.("🌟 Эта функция доступна только в Luna Premium!");
      return;
    }

    triggerHaptic('heavy');
    setIsClosing(true); 

    const userId = localStorage.getItem("telegram_user_id") || "test_user";
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase.from("events").insert({
      user_id: userId,
      date: today,
      type: type,
      value: value
    });

    if (!error) {
      setIsActionModalOpen(false);
      setIsClosing(false);
      window.location.reload(); 
    }
  };

  async function calculateCycle() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    
    // 1. Получаем последнюю запись из БД
    const { data } = await supabase
      .from("periods")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(1)

    // Если в БД пусто, берем дату из Onboarding (localStorage)
    const lastDateStr = data?.[0]?.start_date || localStorage.getItem("last_period")
    if (!lastDateStr) return

    // 2. Загружаем персональные параметры
    const cycleLen = Number(localStorage.getItem("cycle_length")) || 28
    const birthYear = Number(localStorage.getItem("birth_year")) || 2000
    
    const lastStart = new Date(lastDateStr)
    const today = new Date(); 
    today.setHours(0, 0, 0, 0)

    // 3. РАСЧЕТ СЛЕДУЮЩЕГО ПЕРИОДА
    const nextStart = new Date(lastStart)
    nextStart.setDate(lastStart.getDate() + cycleLen)

    const diffMs = nextStart.getTime() - today.getTime()
    const daysUntilPeriod = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    setNextPeriodDays(daysUntilPeriod)

    // 4. УМНЫЙ РАСЧЕТ ОВУЛЯЦИИ
    // Корректируем лютеиновую фазу по возрасту (биологический стандарт)
    const currentYear = new Date().getFullYear()
    const age = currentYear - birthYear
    const lutealPhase = age > 35 ? 13 : 14 

    const ovulationDate = new Date(nextStart)
    ovulationDate.setDate(ovulationDate.getDate() - lutealPhase)

    const ovuDiffMs = ovulationDate.getTime() - today.getTime()
    setOvulationDays(Math.ceil(ovuDiffMs / (1000 * 60 * 60 * 24)))
  }

  return (
    <main className="h-screen bg-[#0e1a2b] text-white flex flex-col pb-4 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full px-6 pt-4 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 border border-blue-400/20 flex items-center justify-center text-xl shadow-lg">
              {avatar}
            </div>
            {isPremium && <div className="absolute -top-1 -right-1 text-[10px]">👑</div>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 font-medium tracking-wide">Привет!</span>
              <div 
                onClick={togglePremiumTest}
                className={`px-1.5 py-0.5 rounded text-[7px] uppercase font-bold border cursor-pointer transition-all active:scale-95 ${
                isPremium ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500" : "bg-white/5 border-white/10 text-gray-500"
              }`}>
                {isPremium ? "Премиум" : "Базовая"}
              </div>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{name}</h2>
          </div>
        </div>
        <button onClick={() => window.location.href = "/settings"} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-lg">⚙️</button>
      </div>

      <div className="px-6 flex-1 flex flex-col max-w-[400px] mx-auto w-full">
        
        {/* Информационные плашки */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#1e293b]/50 p-3 rounded-2xl border border-white/5 text-center">
            <p className="text-[8px] text-gray-400 uppercase mb-0.5 tracking-widest">До месячных</p>
            <p className={`text-sm font-bold ${nextPeriodDays !== null && nextPeriodDays <= 3 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
              {nextPeriodDays !== null ? (nextPeriodDays > 0 ? `${nextPeriodDays} дн.` : 'Сегодня') : '...'}
            </p>
          </div>
          <div className="bg-[#1e293b]/50 p-3 rounded-2xl border border-white/5 text-center">
            <p className="text-[8px] text-gray-400 uppercase mb-0.5 tracking-widest">До овуляции</p>
            <p className="text-sm font-bold text-pink-400">
              {ovulationDays !== null ? (ovulationDays > 0 ? `${ovulationDays} дн.` : 'Сегодня') : '...'}
            </p>
          </div>
        </div>

        {/* Календарь */}
        <div className="flex-1 flex flex-col justify-start">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">Ваш цикл</h3>
            <span className="text-[8px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-mono uppercase">
              {new Date().toLocaleString('ru', { month: 'long' })}
            </span>
          </div>
          <div className="bg-[#1e293b]/40 rounded-[24px] p-1 border border-white/5 shadow-2xl backdrop-blur-md">
            <CycleCalendar />
          </div>
        </div>

        {/* НИЖНИЕ КНОПКИ */}
        <div className="flex items-center gap-3 mt-4 mb-2">
          <button 
            onClick={handleQuickAdd}
            className="flex-1 py-4 rounded-2xl bg-blue-600 font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
          >
            Отметить сегодня
          </button>

          <button 
            onClick={() => { triggerHaptic('medium'); setIsActionModalOpen(true); }}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl flex-shrink-0 active:scale-90 transition-all border-2 ${
              isPremium 
                ? "bg-pink-600 border-pink-500 text-white shadow-pink-900/20" 
                : "bg-gray-800 border-gray-700 text-gray-500 shadow-none"
            }`}
          >
            {isPremium ? "+" : "🔒"}
          </button>

          <Link href="/history" className="flex-1">
            <button className="w-full py-4 rounded-2xl bg-[#1e293b] border border-white/10 font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all">
              История
            </button>
          </Link>
        </div>
      </div>

      {/* Модальное окно */}
      {isActionModalOpen && (
        <div 
          className={`fixed inset-0 z-[100] flex items-end justify-center px-6 pb-24 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          onClick={() => setIsActionModalOpen(false)}
        >
          <div 
            className={`w-full max-w-[320px] bg-[#1e293b] rounded-[32px] p-6 border border-white/10 shadow-2xl transform transition-all duration-300 
              ${isClosing ? 'translate-y-[100px] opacity-0' : 'translate-y-0 opacity-100'} `}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            <h3 className="text-center font-bold text-lg mb-6 text-white/90 tracking-tight">Добавить событие</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleAddEvent('sex', 'protected')} className="w-full py-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">❤️ Секс (ПА)</button>
              <button onClick={() => handleAddEvent('mood', 'happy')} className="w-full py-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">😊 Настроение</button>
            </div>
            <button onClick={() => setIsActionModalOpen(false)} className="w-full mt-6 text-gray-500 text-xs font-bold uppercase tracking-widest">Закрыть</button>
          </div>
        </div>
      )}
    </main>
  )
}
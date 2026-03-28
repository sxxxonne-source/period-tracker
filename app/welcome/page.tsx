"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

// Подключаем Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

const AVAILABLE_EMOJIS = ["🌸", "🌙", "💧", "💗", "🦋", "🌷", "⭐", "✨"]

export default function WelcomePage() {
  const router = useRouter()
  const swiperRef = useRef<any>(null); 
  
  const [name, setName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]) 
  const [cycleLength, setCycleLength] = useState(28)
  const [periodDuration, setPeriodDuration] = useState(5) // Новое: длительность самих месячных
  const [birthYear, setBirthYear] = useState(2000) // Новое: год рождения
  const [lastPeriod, setLastPeriod] = useState(new Date().toISOString().split('T')[0]);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user
        if (user) { setName(user.first_name || ""); }
      }
    }
  }, [])

  function handleContinue() {
    if (!name.trim()) {
      triggerHaptic('heavy');
      const tg = (window as any).Telegram?.WebApp;
      tg?.showAlert?.("Пожалуйста, введите ваше имя");
      return;
    }
    
    // Сохраняем расширенный набор данных
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar_emoji", selectedEmoji)
    localStorage.setItem("cycle_length", cycleLength.toString())
    localStorage.setItem("period_duration", periodDuration.toString()) // Важно для календаря
    localStorage.setItem("birth_year", birthYear.toString()) // Важно для точности овуляции
    localStorage.setItem("last_period", lastPeriod)
    localStorage.setItem("onboarding_complete", "true")
    
    triggerHaptic('medium');
    router.push("/dashboard") 
  }

  return (
    <main className="h-screen w-full flex items-center justify-center bg-[#0e1a2b] text-white overflow-y-auto p-6 scrollbar-hide">
      <div className="w-full max-w-[402px] min-h-full flex flex-col items-center justify-between py-4">
        
        {/* ВЕРХНЯЯ ЧАСТЬ */}
        <div className="w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1">Добро Пожаловать!</h1>
          <p className="text-gray-400 mb-6 text-xs text-center px-4">Давайте познакомимся с вашим циклом</p>

          <div className="relative w-full h-24 flex items-center justify-center mb-6 overflow-hidden">
            <Swiper
              modules={[Autoplay]}
              onSwiper={(swiper) => swiperRef.current = swiper}
              slidesPerView={3}
              centeredSlides={true}
              loop={true}
              onSlideChange={(swiper) => {
                setSelectedEmoji(AVAILABLE_EMOJIS[swiper.realIndex]);
                triggerHaptic('light'); 
              }}
              className="w-full h-full"
            >
              {AVAILABLE_EMOJIS.map((emoji, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  {({ isActive }) => (
                    <div 
                      className={`w-16 h-16 flex items-center justify-center rounded-full border-2 transition-all duration-300 cursor-pointer
                        ${isActive 
                          ? 'border-blue-400 bg-blue-900/40 scale-110 shadow-[0_0_20px_rgba(100,149,237,0.3)]' 
                          : 'border-white/5 bg-[#1e293b]/50 scale-90 opacity-30'}`}
                      onClick={() => swiperRef.current?.slideToLoop(index)}
                    >
                      <span className="text-4xl">{emoji}</span>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* СРЕДНЯЯ ЧАСТЬ - СЕТКА С НАСТРОЙКАМИ */}
        <div className="w-full space-y-3 mb-6">
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1e293b] border border-white/5 rounded-2xl py-3.5 px-6 text-center text-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Блок: Цикл */}
            <div className="bg-[#1e293b]/50 p-4 rounded-[24px] border border-white/5">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 text-center font-bold">Цикл</p>
              <div className="flex items-center justify-between bg-[#0e1a2b] rounded-xl p-1 border border-white/5">
                <button onClick={() => { setCycleLength(prev => Math.max(21, prev - 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">—</button>
                <span className="text-sm font-bold">{cycleLength}</span>
                <button onClick={() => { setCycleLength(prev => Math.min(45, prev + 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">+</button>
              </div>
              <p className="text-[8px] text-gray-500 mt-2 text-center italic">В среднем 28 дней</p>
            </div>

            {/* Блок: Длительность месячных */}
            <div className="bg-[#1e293b]/50 p-4 rounded-[24px] border border-white/5">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 text-center font-bold">Месячные</p>
              <div className="flex items-center justify-between bg-[#0e1a2b] rounded-xl p-1 border border-white/5">
                <button onClick={() => { setPeriodDuration(prev => Math.max(2, prev - 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">—</button>
                <span className="text-sm font-bold">{periodDuration}</span>
                <button onClick={() => { setPeriodDuration(prev => Math.min(10, prev + 1)); triggerHaptic('soft'); }} className="w-8 h-8 text-blue-400">+</button>
              </div>
              <p className="text-[8px] text-gray-500 mt-2 text-center italic">В среднем 5 дней</p>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Блок: Год рождения */}
            <div className="flex-[0.4] bg-[#1e293b]/50 p-4 rounded-[24px] border border-white/5 flex flex-col justify-center">
               <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 text-center font-bold">Год рождения</p>
               <input 
                 type="number" 
                 min="1950" max="2015"
                 value={birthYear}
                 onChange={(e) => setBirthYear(Number(e.target.value))}
                 className="w-full bg-[#0e1a2b] border border-white/5 rounded-xl py-2 text-blue-400 text-center text-sm outline-none"
               />
            </div>

            {/* Блок: Дата */}
            <div className="flex-[0.6] bg-[#1e293b]/50 p-4 rounded-[24px] border border-white/5">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 text-center font-bold">Последние месячные</p>
              <input 
                type="date" 
                value={lastPeriod}
                onChange={(e) => { setLastPeriod(e.target.value); triggerHaptic('light'); }}
                className="w-full bg-[#0e1a2b] border border-white/5 rounded-xl py-2 px-2 text-blue-400 text-center text-sm outline-none appearance-none"
              />
            </div>
          </div>
        </div>

        {/* НИЖНЯЯ ЧАСТЬ */}
        <div className="w-full pt-2">
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
          >
            Продолжить
          </button>
        </div>
      </div>
    </main>
  )
}
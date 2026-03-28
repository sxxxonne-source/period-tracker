"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

// Подключаем Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

// Список доступных эмодзи
const AVAILABLE_EMOJIS = ["🌸", "🌙", "💧", "💗", "🦋", "🌷", "⭐", "✨"]

// Кастомный хук для вибрации
const useHaptics = () => {
  const trigger = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
    }
  };
  return trigger;
};

export default function WelcomePage() {
  const router = useRouter()
  const swiperRef = useRef<any>(null); 
  const triggerHaptic = useHaptics();
  
  const [name, setName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]) 
  const [cycleLength, setCycleLength] = useState(28)
  
  // Дата - сегодня (для старта)
  const [lastPeriod, setLastPeriod] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.expand();
        tg.ready();
        const user = tg.initDataUnsafe?.user
        if (user) { setName(user.first_name || ""); }
      }
    }
  }, [])

  function handleContinue() {
    if (!name.trim()) {
      triggerHaptic('heavy');
      return alert("Введите имя");
    }
    
    // Сохраняем настройки
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar_emoji", selectedEmoji)
    localStorage.setItem("cycle_length", cycleLength.toString())
    localStorage.setItem("last_period", lastPeriod)
    localStorage.setItem("onboarding_complete", "true")
    
    triggerHaptic('medium');
    router.push("/dashboard") 
  }

  return (
    // ГЛАВНЫЙ КОНТЕЙНЕР: h-screen, flex-col, overflow-hidden
    <main className="h-screen w-full flex items-center justify-center bg-[#0e1a2b] text-white overflow-hidden p-6">
      
      {/* Контейнер-телефон (как в Figma), flex-col, space-between */}
      <div className="w-full max-w-[402px] h-full flex flex-col items-center justify-between">
        
        {/* ВЕРХНЯЯ ЧАСТЬ (Приветствие и Swiper) */}
        <div className="w-full flex flex-col items-center pt-8">
          <h1 className="text-3xl font-bold mb-1">Привет!</h1>
          <p className="text-gray-400 mb-8 text-sm">Давайте настроим ваш профиль</p>

          {/* КАРУСЕЛЬ ЭМОДЗИ С ГРАДИЕНТОМ И ЦЕНТРИРОВАНИЕМ */}
          {/* Исправление: Обернули Swiper в div с фиксированной высотой и overflow-hidden */}
          <div className="relative w-full h-32 flex items-center justify-center mb-4 overflow-hidden -mt-2">
            <Swiper
              modules={[Autoplay]}
              onSwiper={(swiper) => swiperRef.current = swiper}
              slidesPerView={3}
              centeredSlides={true}
              loop={true}
              onSlideChange={(swiper) => {
                const realIndex = swiper.realIndex;
                const emoji = AVAILABLE_EMOJIS[realIndex % AVAILABLE_EMOJIS.length];
                setSelectedEmoji(emoji);
                triggerHaptic('light'); // Вибрация при свайпе!
              }}
              className="w-full h-full"
            >
              {AVAILABLE_EMOJIS.map((emoji, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  {({ isActive }) => (
                    <div 
                      className={`w-20 h-20 flex items-center justify-center rounded-full border-2 transition-all duration-300
                        ${isActive 
                          ? 'border-blue-400 bg-blue-900/40 scale-105 shadow-[0_0_25px_rgba(100,149,237,0.4)]' 
                          : 'border-white/5 bg-[#1e293b]/50 scale-90 opacity-40'}`}
                      onClick={() => {
                        swiperRef.current?.slideToLoop(index);
                        triggerHaptic('soft');
                      }}
                    >
                      <span className="text-5xl">{emoji}</span>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* СРЕДНЯЯ ЧАСТЬ (Поля ввода) - теперь сжимается и центрируется */}
        <div className="w-full flex-1 flex flex-col justify-center space-y-4 max-h-[60%]">
          
          {/* ПОЛЕ ИМЕНИ */}
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1e293b] border border-white/5 rounded-2xl py-4 px-6 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
          />

          {/* ПРОДОЛЖИТЕЛЬНОСТЬ ЦИКЛА */}
          <div className="bg-[#1e293b]/50 p-5 rounded-[28px] border border-white/5 shadow-inner">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-3 text-center font-bold">Длина цикла</p>
            <div className="flex items-center justify-between bg-[#0e1a2b] rounded-xl p-1 border border-white/5 shadow-lg">
              <button 
                onClick={() => { setCycleLength(Math.max(21, cycleLength - 1)); triggerHaptic('rigid'); }} 
                className="w-12 h-12 flex items-center justify-center text-2xl font-light hover:text-blue-400 text-blue-400 active:scale-90 transition-transform duration-100"
              >—</button>
              <span className="text-xl font-bold">{cycleLength} дней</span>
              <button 
                onClick={() => { setCycleLength(Math.min(45, cycleLength + 1)); triggerHaptic('rigid'); }} 
                className="w-12 h-12 flex items-center justify-center text-2xl font-light hover:text-blue-400 text-blue-400 active:scale-90 transition-transform duration-100"
              >+</button>
            </div>
          </div>

          {/* ДАТА ПОСЛЕДНИХ МЕСЯЧНЫХ */}
          <div className="bg-[#1e293b]/50 p-5 rounded-[28px] border border-white/5 shadow-inner">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-3 text-center font-bold">Последние месячные</p>
            <input 
              type="date" 
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full bg-[#0e1a2b] border border-white/5 rounded-xl py-3.5 px-6 text-blue-400 text-center text-lg outline-none appearance-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* НИЖНЯЯ ЧАСТЬ (Кнопка старта) */}
        <div className="w-full pb-6 pt-4">
          <button
            onClick={handleContinue}
            className="w-full py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
          >
            Начать путешествие
          </button>
        </div>

      </div>
    </main>
  )
}
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
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    } else {
      console.log(`[Mock Haptics]: ${type}`);
    }
  };
  return trigger;
};

export default function WelcomePage() {
  const router = useRouter()
  const swiperRef = useRef<any>(null); // Реф для доступа к API Swiper
  const triggerHaptic = useHaptics();
  
  // Состояния
  const [name, setName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]) 
  const [cycleLength, setCycleLength] = useState(28)
  const [lastPeriod, setLastPeriod] = useState("2026-03-12") // Текущая дата для теста

  useEffect(() => {
    // Получаем имя из Telegram
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.expand()
      tg.ready() // Готовность SDK
      const user = tg.initDataUnsafe?.user
      if (user) {
        setName(user.first_name || "")
      }
    }
  }, [])

  function handleContinue() {
    if (!name) return alert("Введите имя")
    
    // Сохраняем данные для Luna
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar_emoji", selectedEmoji)
    localStorage.setItem("cycle_length", cycleLength.toString())
    localStorage.setItem("last_period", lastPeriod)
    
    // Вибрация при успешном нажатии
    triggerHaptic('medium');

    router.push("/dashboard") // Переход на главный календарь
  }

  return (
    // ГЛАВНЫЙ КОНТЕЙНЕР: h-screen без прокрутки
    <main className="h-screen w-full flex items-center justify-center p-6 bg-[#0e1a2b] text-white overflow-hidden">
      
      {/* Контейнер-телефон (как в Figma) */}
      <div className="w-full max-w-[402px] h-full flex flex-col items-center justify-between">
        
        {/* ВЕРХНЯЯ ЧАСТЬ (Приветствие и Swiper) */}
        <div className="w-full flex flex-col items-center pt-10">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-gray-400 mb-6 text-sm">Давайте познакомимся с вашим циклом</p>

          {/* КАРУСЕЛЬ ЭМОДЗИ С ГРАДИЕНТОМ И ЦЕНТРИРОВАНИЕМ */}
          <div className="relative w-full h-32 flex items-center justify-center group mb-6 -mt-2">
            
            {/* Swiper */}
            <Swiper
              modules={[Autoplay]}
              onSwiper={(swiper) => swiperRef.current = swiper}
              slidesPerView={3} // Видим 3 эмодзи
              centeredSlides={true} // Активный - по центру
              loop={true} // Бесконечная прокрутка
              // Убрали автоплей для теста
              // autoplay={{ delay: 2000, disableOnInteraction: true }} // disableOnInteraction: true!
              onSlideChange={(swiper) => {
                const realIndex = swiper.realIndex;
                const emoji = AVAILABLE_EMOJIS[realIndex % AVAILABLE_EMOJIS.length];
                setSelectedEmoji(emoji);
                
                // Вибрация при свайпе!
                if (swiper.isBeginning || swiper.isEnd) return; // Пропускаем первый/последний
                triggerHaptic('light');
              }}
              className="w-full h-full"
            >
              {AVAILABLE_EMOJIS.map((emoji, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center cursor-pointer">
                  {/* Контейнер для эмодзи с динамическими стилями */}
                  {({ isActive }) => (
                    <div className={`relative w-20 h-20 flex items-center justify-center rounded-full border-2 transition-all duration-300
                      ${isActive 
                        ? 'border-blue-400 bg-blue-900/40 scale-105 shadow-[0_0_30px_rgba(100,149,237,0.5)]' 
                        : 'border-white/5 bg-[#1e293b]/50 scale-90 opacity-60'}`}
                      style={{
                        margin: '0 auto', // Центрирование слайда!
                      }}
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

        {/* СРЕДНЯЯ ЧАСТЬ (Настройки) */}
        <div className="w-full flex-grow flex flex-col justify-center space-y-6 max-h-[50%]">
          {/* ПОЛЕ ИМЕНИ */}
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1e293b] border-none rounded-2xl py-4 px-6 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 shadow-inner"
          />

          {/* ПРОДОЛЖИТЕЛЬНОСТЬ ЦИКЛА (+/- КНОПКИ) */}
          <div className="bg-[#1e293b]/50 p-6 rounded-[32px] border border-white/5 shadow-inner">
            <p className="text-sm font-medium mb-4 text-center">Продолжительность цикла</p>
            <div className="flex items-center justify-between bg-[#0e1a2b] rounded-2xl p-1 border border-white/10 shadow-lg">
              <button 
                onClick={() => { setCycleLength(Math.max(21, cycleLength - 1)); triggerHaptic('rigid'); }} 
                className="w-12 h-12 flex items-center justify-center text-2xl font-light hover:text-blue-400 active:text-blue-200 transition-colors"
              >—</button>
              <span className="text-xl font-semibold text-blue-400">{cycleLength} Дней</span>
              <button 
                onClick={() => { setCycleLength(Math.min(35, cycleLength + 1)); triggerHaptic('rigid'); }} 
                className="w-12 h-12 flex items-center justify-center text-2xl font-light hover:text-blue-400 active:text-blue-200 transition-colors"
              >+</button>
            </div>
          </div>

          {/* ВЕРНУЛИ ВЫБОР ДАТЫ ПОСЛЕДНЕГО ПЕРИОДА */}
          <div className="bg-[#1e293b]/50 p-6 rounded-[32px] border border-white/5 shadow-inner">
            <p className="text-sm font-medium mb-4 text-center">Последний период</p>
            <input 
              type="date" 
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full bg-[#0e1a2b] border border-white/10 rounded-2xl py-4 px-6 text-blue-400 text-center outline-none appearance-none shadow-lg focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* НИЖНЯЯ ЧАСТЬ (Кнопка Продолжить) */}
        <div className="w-full pb-8 pt-4">
          <button
            onClick={handleContinue}
            className="w-full py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform duration-100"
          >
            Продолжить
          </button>
        </div>

      </div>
    </main>
  )
}
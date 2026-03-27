"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

// Подключаем Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

// Список доступных эмодзи
const AVAILABLE_EMOJIS = ["🌙", "🌸", "💧", "💗", "🦋", "🌷", "⭐", "✨"]

export default function WelcomePage() {
  const router = useRouter()
  const swiperRef = useRef<any>(null); // Реф для доступа к API Swiper
  
  // Состояния
  const [name, setName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]) // По умолчанию первое
  const [cycleLength, setCycleLength] = useState(28)
  const [lastPeriod, setLastPeriod] = useState("2026-03-12") // Текущая дата для теста

  useEffect(() => {
    // Получаем имя из Telegram
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.expand()
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
    
    router.push("/dashboard") // Переход на главный календарь
  }

  return (
    // ГЛАВНЫЙ КОНТЕЙНЕР: h-screen без прокрутки
    <main className="h-screen w-full flex items-center justify-center p-6 bg-[#0e1a2b] text-white overflow-hidden">
      
      {/* Контейнер-телефон (как в Figma) */}
      <div className="w-full max-w-[402px] h-full flex flex-col items-center justify-between">
        
        {/* ВЕРХНЯЯ ЧАСТЬ (Приветствие и Аватар) */}
        <div className="w-full flex flex-col items-center pt-8">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-gray-400 mb-8 text-sm">Давайте познакомимся с вашим циклом</p>

          {/* КАРУСЕЛЬ ЭМОДЗИ С ГРАДИЕНТОМ */}
          <div className="relative w-full h-32 flex items-center justify-center group mb-8">
            
            {/* ГРАДИЕНТНЫЕ МАСКИ С КРАЕВ (Эффект "ухода под фон") */}
            <div className="absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-[#0e1a2b] via-[#0e1a2b]/90 to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[#0e1a2b] via-[#0e1a2b]/90 to-transparent pointer-events-none"></div>

            {/* Swiper */}
            <Swiper
              modules={[Autoplay]}
              onSwiper={(swiper) => swiperRef.current = swiper}
              slidesPerView={3} // Видим 3 эмодзи
              centeredSlides={true} // Активный - по центру
              loop={true} // Бесконечная прокрутка
              autoplay={{ delay: 1500, disableOnInteraction: false }} // Автоматическое перелистывание
              onSlideChange={(swiper) => {
                // Выбираем центральный эмодзи
                setSelectedEmoji(AVAILABLE_EMOJIS[swiper.realIndex % AVAILABLE_EMOJIS.length])
              }}
              className="w-full h-full"
            >
              {AVAILABLE_EMOJIS.map((emoji, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center cursor-pointer">
                  {/* Контейнер для эмодзи с динамическими стилями */}
                  {({ isActive, isNext, isPrev }) => (
                    <div className={`relative w-20 h-20 flex items-center justify-center rounded-full border-2 transition-all duration-300
                      ${isActive 
                        ? 'border-blue-400/50 bg-blue-900/20 scale-110 shadow-[0_0_20px_rgba(100,149,237,0.4)]' 
                        : 'border-white/5 bg-[#1e293b]/50 scale-90'}`}
                      style={{
                        // Плавная прозрачность для неактивных слайдов
                        opacity: isActive ? 1 : isNext || isPrev ? 0.4 : 0.1,
                      }}
                      onClick={() => swiperRef.current?.slideToLoop(index)}
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
        <div className="w-full flex-grow flex flex-col justify-center space-y-6 max-h-[45%]">
          {/* ПОЛЕ ИМЕНИ */}
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1e293b] border-none rounded-2xl py-4 px-6 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
          />

          <div className="bg-[#1e293b]/50 p-6 rounded-[32px] border border-white/5">
            <p className="text-sm font-medium mb-4 text-center">Продолжительность цикла</p>
            <div className="flex items-center justify-between bg-[#0e1a2b] rounded-2xl p-1 border border-white/10">
              <button onClick={() => setCycleLength(Math.max(21, cycleLength - 1))} className="w-12 h-12 flex items-center justify-center text-2xl hover:text-blue-400">💧</button>
              <span className="text-xl font-semibold text-blue-400">{cycleLength} Дней</span>
              <button onClick={() => setCycleLength(Math.min(35, cycleLength + 1))} className="w-12 h-12 flex items-center justify-center text-2xl hover:text-blue-400">🌊</button>
            </div>
          </div>
        </div>

        {/* НИЖНЯЯ ЧАСТЬ (Кнопка) */}
        <div className="w-full pb-8">
          <button
            onClick={handleContinue}
            className="w-full py-5 rounded-[24px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform"
          >
            Продолжить
          </button>
        </div>

      </div>
    </main>
  )
}
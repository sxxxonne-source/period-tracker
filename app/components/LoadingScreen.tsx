"use client"

import Image from 'next/image'

export default function LoadingScreen() {
  return (
    /* h-screen и overflow-hidden предотвращают скролл. touch-none отключает случайные свайпы */
    <div className="fixed inset-0 h-screen w-full bg-[#0e1a2b] flex items-center justify-center overflow-hidden touch-none z-[999]">
      
      {/* Основной контейнер теперь занимает 100% высоты без лишних отступов */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(circle at center, #2f4a6d 0%, #1f324d 40%, #0e1a2b 100%)",
        }}
      >
        {/* Надпись "window loading" удалена */}

        {/* ЛОГО LUNA с анимацией пульсации */}
        <div className="relative flex items-center justify-center">
          {/* Слой свечения сзади */}
          <div className="absolute inset-0 bg-blue-400/20 blur-[60px] rounded-full animate-pulse scale-150"></div>
          
          <div className="relative w-48 h-48 animate-bounce-slow">
            <Image 
              src="/luna-logo.png" 
              alt="Luna App Logo" 
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(100,149,237,0.5)]"
              priority
            />
          </div>
        </div>

        {/* Название под логотипом */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-extralight tracking-[0.4em] text-white/90 ml-[0.4em]">
            LUNA
          </h1>
        </div>

        {/* Индикатор загрузки (полоска) */}
        <div className="absolute bottom-24 w-32 h-[2px] bg-white/10 overflow-hidden rounded-full">
           <div className="h-full bg-blue-400/60 animate-loading-bar shadow-[0_0_10px_#6495ed]"></div>
        </div>

        {/* Текст снизу */}
        <p className="absolute bottom-10 text-[10px] text-gray-500 tracking-[0.2em] uppercase">
          © 2026 Telegram Mini App
        </p>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          width: 100%;
          animation: loading-bar 2s infinite ease-in-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { supabase } from "../lib/supabase"

// Вспомогательные функции
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function CycleCalendar() {
  const [periods, setPeriods] = useState<any[]>([])

  useEffect(() => {
    loadPeriods();
  }, [])

  async function loadPeriods() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user";
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId);

    if (data) {
      const mapped = data.map((p: any) => ({
        date: startOfDay(new Date(p.start_date)),
        duration: p.duration || 5
      }))
      setPeriods(mapped)
    }
  }

  async function handleDayClick(value: Date) {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

    const date = startOfDay(value);
    const formatted = date.toISOString().split("T")[0];
    const userId = localStorage.getItem("telegram_user_id") || "test_user";

    const existing = periods.find(p => p.date.toISOString().split("T")[0] === formatted);

    if (existing) {
      // Здесь можно вызвать красивое меню Telegram вместо обычного confirm
      if (confirm("Удалить отметку периода?")) {
        await supabase.from("periods").delete().eq("user_id", userId).eq("start_date", formatted);
        loadPeriods();
      }
      return;
    }

    // Сохраняем новый период
    const defaultDuration = Number(localStorage.getItem("cycle_length")) || 5;
    await supabase.from("periods").insert({
      user_id: userId,
      start_date: formatted,
      duration: defaultDuration > 10 ? 5 : defaultDuration // Защита от путаницы с длиной цикла
    });

    loadPeriods();
  }

  function tileClassName({ date }: { date: Date }) {
    const day = startOfDay(date);

    for (const p of periods) {
      const start = p.date;
      const duration = p.duration;
      const periodEnd = addDays(start, duration - 1);
      
      // Примерная логика овуляции (14 дней до конца 28-дневного цикла)
      const cycleLen = Number(localStorage.getItem("cycle_length")) || 28;
      const ovulation = addDays(start, cycleLen - 14);
      const fertilityStart = addDays(ovulation, -2);
      const fertilityEnd = addDays(ovulation, 2);

      if (day >= start && day <= periodEnd) return "period";
      if (day.getTime() === ovulation.getTime()) return "ovulation";
      if (day >= fertilityStart && day <= fertilityEnd) return "fertility";
    }
    return "";
  }

  return (
    <div className="w-full">
      <Calendar
        onClickDay={handleDayClick}
        tileClassName={tileClassName}
        locale="ru-RU" // Устанавливаем русский язык
        prev2Label={null} // Убираем переход на год назад
        next2Label={null} // Убираем переход на год вперед
      />
      
      {/* Легенда под календарем в стиле Luna */}
      <div className="flex justify-center gap-4 mt-6 text-[10px] text-gray-400 uppercase tracking-widest">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ff4d6d]"></span> Период
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span> Фертильность
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white border border-blue-400"></span> Овуляция
        </div>
      </div>
    </div>
  )
}
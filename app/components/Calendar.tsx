"use client"

import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type Period = {
  start_date: string
  duration: number
}

type UserEvent = {
  date: string
  type: string
}

export default function CycleCalendar() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [events, setEvents] = useState<UserEvent[]>([])
  const [value, setValue] = useState<Value>(null); 
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [birthYear, setBirthYear] = useState(2000); // Добавили для точности
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCycleLength(Number(localStorage.getItem("cycle_length")) || 28);
      setPeriodDuration(Number(localStorage.getItem("period_duration")) || 5);
      setBirthYear(Number(localStorage.getItem("birth_year")) || 2000);
      setIsPremium(localStorage.getItem("user_subscription") === "premium");
      
      fetchPeriods();
      fetchEvents();
    }
  }, [])

  async function fetchPeriods() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (data && data.length > 0) {
      setPeriods(data)
    } else {
      const initialDate = localStorage.getItem("last_period");
      if (initialDate) {
        setPeriods([{ start_date: initialDate, duration: periodDuration }]);
      }
    }
  }

  async function fetchEvents() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data } = await supabase
      .from("events")
      .select("date, type")
      .eq("user_id", userId)
      .eq("type", "sex")

    if (data) setEvents(data)
  }

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null
    
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0]
    let classes: string[] = []

    // 1. Секс ❤️
    if (events.some(e => e.date === dateStr)) classes.push('tile-sex')

    if (periods.length > 0) {
      const lastRecordedStart = new Date(periods[0].start_date);
      lastRecordedStart.setHours(0,0,0,0);

      // 2. Реальные записи (Розовый)
      const isHistorical = periods.some(p => {
        const s = new Date(p.start_date); s.setHours(0,0,0,0);
        const e = new Date(s); e.setDate(s.getDate() + (p.duration - 1));
        return d >= s && d <= e;
      });

      if (isHistorical) {
        classes.push('tile-period');
      } else {
        // 3. Умный прогноз (на основе возраста и длины цикла)
        const cyclesToPredict = isPremium ? 12 : 3;
        const age = new Date().getFullYear() - birthYear;
        const lutealPhase = age > 35 ? 13 : 14; 

        // Проверяем будущие циклы (i > 0) и один прошлый (i < 0) для красоты
        for (let i = -1; i <= cyclesToPredict; i++) {
          if (i === 0) continue; // Пропускаем текущий, так как он либо в базе, либо виртуальный

          const pStart = new Date(lastRecordedStart);
          pStart.setDate(lastRecordedStart.getDate() + (cycleLength * i));
          
          const pEnd = new Date(pStart);
          pEnd.setDate(pStart.getDate() + (periodDuration - 1));

          // Прогноз месячных
          if (d >= pStart && d <= pEnd) {
            classes.push('tile-predicted');
            break;
          }

          // Овуляция (за 14 дней до следующего начала)
          const ovu = new Date(pStart);
          ovu.setDate(pStart.getDate() - lutealPhase);
          const ovuStr = ovu.toISOString().split('T')[0];

          if (dateStr === ovuStr) {
            classes.push('tile-ovulation');
            break;
          }

          // Фертильное окно
          const fStart = new Date(ovu); fStart.setDate(ovu.getDate() - 4);
          const fEnd = new Date(ovu); fEnd.setDate(ovu.getDate() + 1);
          if (d >= fStart && d <= fEnd) {
            classes.push('tile-fertility');
            break;
          }
        }
      }
    }

    // Текущий день
    const today = new Date(); today.setHours(0,0,0,0);
    if (d.getTime() === today.getTime()) classes.push('tile-today')

    return classes.join(' ')
  }

  return (
    <div className="calendar-container relative">
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={getTileClassName}
        locale="ru-RU"
        prev2Label={null}
        next2Label={null}
        // Исправлено: Понедельник — первый день недели
        formatShortWeekday={(locale, date) => 
          ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]
        }
        calendarType="iso8601" 
      />
      
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2 pb-2 text-[8px] uppercase tracking-widest text-gray-400 font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff4d6d]"></div> Период
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7FFFD4] shadow-[0_0_5px_#7FFFD4]"></div> Овуляция
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#4caf50]/40 border border-[#4caf50]"></div> Фертильность
        </div>
        <div className="flex items-center gap-1.5">
          <span>❤️</span> Секс
        </div>
      </div>
    </div>
  )
}
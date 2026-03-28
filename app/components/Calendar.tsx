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
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCycle = localStorage.getItem("cycle_length");
      if (savedCycle) setCycleLength(Number(savedCycle));
      
      // Проверяем статус премиума из localStorage
      setIsPremium(localStorage.getItem("user_subscription") === "premium");
      
      fetchPeriods();
      fetchEvents();
    }
  }, [])

  async function fetchPeriods() {
    const userId = (typeof window !== "undefined" && localStorage.getItem("telegram_user_id")) || "test_user"
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (data) setPeriods(data)
  }

  async function fetchEvents() {
    const userId = (typeof window !== "undefined" && localStorage.getItem("telegram_user_id")) || "test_user"
    const { data } = await supabase
      .from("events")
      .select("date, type")
      .eq("user_id", userId)
      .eq("type", "sex")

    if (data) setEvents(data)
  }

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null
    const dateStr = date.toISOString().split('T')[0]
    let classes: string[] = []

    // 1. Секс (Сердечко)
    if (events.some(e => e.date === dateStr)) classes.push('tile-sex')

    // 2. Реальные записанные месячные (розовый)
    const isRecorded = periods.some(p => {
      const start = new Date(p.start_date); start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(start.getDate() + (p.duration - 1));
      return date >= start && date <= end;
    })
    
    if (isRecorded) {
      classes.push('tile-period')
      return classes.join(' ')
    }

    // 3. ЛОГИКА ПРОГНОЗА (на год вперед для Premium)
    if (periods.length > 0) {
      const lastStart = new Date(periods[0].start_date);
      const duration = periods[0].duration || 5;
      
      // Сколько циклов прогнозировать? 13 циклов ~ 1 год.
      const cyclesToPredict = isPremium ? 13 : 1;

      for (let i = 1; i <= cyclesToPredict; i++) {
        const pStart = new Date(lastStart);
        pStart.setDate(lastStart.getDate() + (cycleLength * i));
        const pEnd = new Date(pStart);
        pEnd.setDate(pStart.getDate() + (duration - 1));

        // Если дата попадает в этот прогнозный цикл
        if (date >= pStart && date <= pEnd) {
          classes.push('tile-predicted');
          break;
        }

        // Овуляция и фертильность для каждого прогнозного цикла
        const ovu = new Date(pStart);
        ovu.setDate(pStart.getDate() - 14);
        const ovuStr = ovu.toISOString().split('T')[0];

        if (dateStr === ovuStr) {
          classes.push('tile-ovulation');
          break;
        }

        const fStart = new Date(ovu); fStart.setDate(ovu.getDate() - 3);
        const fEnd = new Date(ovu); fEnd.setDate(ovu.getDate() + 1);
        if (date >= fStart && date <= fEnd) {
          classes.push('tile-fertility');
          break;
        }
      }
    }

    // Текущий день
    const today = new Date(); today.setHours(0,0,0,0);
    if (date.getTime() === today.getTime()) classes.push('tile-today')

    return classes.join(' ')
  }

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={getTileClassName}
        locale="ru-RU"
        prev2Label={null}
        next2Label={null}
        formatShortWeekday={(locale, date) => 
          ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][date.getDay() === 0 ? 6 : date.getDay() - 1]
        }
      />
      
      <div className="flex justify-around mt-4 pb-2 text-[9px] uppercase tracking-widest text-gray-400 font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff4d6d]"></div> Период
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7FFFD4]"></div> Овуляция
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]"></div> Фертильность
        </div>
        <div className="flex items-center gap-1.5">
          <span>❤️</span> Секс
        </div>
      </div>
    </div>
  )
}
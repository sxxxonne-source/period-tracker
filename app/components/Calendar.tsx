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
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCycleLength(Number(localStorage.getItem("cycle_length")) || 28);
      setPeriodDuration(Number(localStorage.getItem("period_duration")) || 5);
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
      // Если в базе пусто, создаем "виртуальный" период из данных онбординга
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
    
    // Убираем время для точного сравнения
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0]
    let classes: string[] = []

    // 1. Отметки Секса (❤️)
    if (events.some(e => e.date === dateStr)) classes.push('tile-sex')

    // 2. Реальные или предсказанные периоды
    if (periods.length > 0) {
      const lastRecordedStart = new Date(periods[0].start_date);
      lastRecordedStart.setHours(0,0,0,0);

      // Проверяем, попадает ли дата в прошлые записанные циклы
      const isHistorical = periods.some(p => {
        const s = new Date(p.start_date); s.setHours(0,0,0,0);
        const e = new Date(s); e.setDate(s.getDate() + (p.duration - 1));
        return d >= s && d <= e;
      });

      if (isHistorical) {
        classes.push('tile-period');
      } else {
        // Логика прогноза вперед
        const cyclesToPredict = isPremium ? 12 : 3; // Для Free даем прогноз на 3 месяца

        for (let i = 1; i <= cyclesToPredict; i++) {
          const pStart = new Date(lastRecordedStart);
          pStart.setDate(lastRecordedStart.getDate() + (cycleLength * i));
          
          const pEnd = new Date(pStart);
          pEnd.setDate(pStart.getDate() + (periodDuration - 1));

          // Менструация (прогноз)
          if (d >= pStart && d <= pEnd) {
            classes.push('tile-predicted');
            break;
          }

          // Овуляция (Цикл - 14 дней)
          const ovu = new Date(pStart);
          ovu.setDate(pStart.getDate() - 14);
          const ovuStr = ovu.toISOString().split('T')[0];

          if (dateStr === ovuStr) {
            classes.push('tile-ovulation');
            break;
          }

          // Фертильное окно (4 дня до овуляции + 1 после)
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
        formatShortWeekday={(locale, date) => 
          ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]
        }
      />
      
      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2 pb-2 text-[8px] uppercase tracking-widest text-gray-400 font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff4d6d]"></div> Месячные
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7FFFD4] shadow-[0_0_5px_#7FFFD4]"></div> Овуляция
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#4caf50]/40 border border-[#4caf50]"></div> Шанс зачать
        </div>
        <div className="flex items-center gap-1.5">
          <span>❤️</span> Секс
        </div>
      </div>
    </div>
  )
}
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

// Тип для событий (секс, симптомы и т.д.)
type UserEvent = {
  date: string
  type: string
}

export default function CycleCalendar() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [events, setEvents] = useState<UserEvent[]>([]) // Состояние для сердечек
  const [value, setValue] = useState<Value>(null); 
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCycle = localStorage.getItem("cycle_length");
      if (savedCycle) setCycleLength(Number(savedCycle));
      fetchPeriods();
      fetchEvents(); // Загружаем события ПА
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

  // Загрузка ПА из новой таблицы
  async function fetchEvents() {
    const userId = (typeof window !== "undefined" && localStorage.getItem("telegram_user_id")) || "test_user"
    const { data } = await supabase
      .from("events")
      .select("date, type")
      .eq("user_id", userId)
      .eq("type", "sex") // Берем только отметки секса

    if (data) setEvents(data)
  }

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null
    const dateStr = date.toISOString().split('T')[0]
    
    // Массив для хранения всех подходящих классов
    let classes: string[] = []

    // 1. Проверка на СЕКС (Сердечко) - добавляем класс всегда, если есть событие
    const hasSex = events.some(e => e.date === dateStr)
    if (hasSex) classes.push('tile-sex')

    // 2. ПРИОРИТЕТ: Реальные месячные (Розовый)
    const isRecordedPeriod = periods.some(p => {
      const start = new Date(p.start_date)
      const end = new Date(start)
      end.setDate(start.getDate() + (p.duration - 1))
      return date >= start && date <= end
    })
    
    if (isRecordedPeriod) {
      classes.push('tile-period')
    } else if (periods.length > 0) {
      // 3. Логика ПРОГНОЗА, ОВУЛЯЦИИ И ФЕРТИЛЬНОСТИ
      const lastRecordedStart = new Date(periods[0].start_date)
      const duration = periods[0].duration || 5
      const predictedStart = new Date(lastRecordedStart)
      predictedStart.setDate(lastRecordedStart.getDate() + cycleLength)
      const predictedEnd = new Date(predictedStart)
      predictedEnd.setDate(predictedStart.getDate() + (duration - 1))

      if (date >= predictedStart && date <= predictedEnd) {
        classes.push('tile-predicted')
      }

      const ovulationDate = new Date(predictedStart)
      ovulationDate.setDate(ovulationDate.getDate() - 14)
      
      if (dateStr === ovulationDate.toISOString().split('T')[0]) {
        classes.push('tile-ovulation')
      } else {
        const fertStart = new Date(ovulationDate)
        fertStart.setDate(ovulationDate.getDate() - 3)
        const fertEnd = new Date(ovulationDate)
        fertEnd.setDate(ovulationDate.getDate() + 1)
        if (date >= fertStart && date <= fertEnd) {
          classes.push('tile-fertility')
        }
      }
    }

    // Выделение текущего дня
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date.getTime() === today.getTime()) classes.push('tile-today')

    return classes.join(' ') // Возвращаем строку классов, разделенных пробелом
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
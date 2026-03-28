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

export default function CycleCalendar() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [value, setValue] = useState<Value>(new Date());
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCycle = localStorage.getItem("cycle_length");
      if (savedCycle) setCycleLength(Number(savedCycle));
      fetchPeriods();
    }
  }, [])

  async function fetchPeriods() {
    const userId = (typeof window !== "undefined" && localStorage.getItem("telegram_user_id")) || "test_user"
    
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false }) // ВАЖНО: Сортируем, чтобы последний был первым

    if (data) setPeriods(data)
  }

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateStr = date.toISOString().split('T')[0]
    
    // 1. Отображение РЕАЛЬНЫХ данных из базы
    const isRecordedPeriod = periods.some(p => {
      const start = new Date(p.start_date)
      const end = new Date(start)
      end.setDate(start.getDate() + (p.duration - 1))
      return date >= start && date <= end
    })
    
    if (isRecordedPeriod) return 'period'

    // 2. Логика ПРОГНОЗА на следующий месяц
    if (periods.length > 0) {
      const lastRecordedStart = new Date(periods[0].start_date)
      const duration = periods[0].duration || 5
      
      // Рассчитываем дату начала СЛЕДУЮЩЕГО цикла
      const predictedStart = new Date(lastRecordedStart)
      predictedStart.setDate(lastRecordedStart.getDate() + cycleLength)

      const predictedEnd = new Date(predictedStart)
      predictedEnd.setDate(predictedStart.getDate() + (duration - 1))

      // Красим прогнозируемый период
      if (date >= predictedStart && date <= predictedEnd) {
        return 'period-predicted'
      }

      // --- ОВУЛЯЦИЯ И ФЕРТИЛЬНОСТЬ ДЛЯ ПРОГНОЗА ---
      const ovulationDate = new Date(predictedStart)
      ovulationDate.setDate(ovulationDate.getDate() - 14)
      
      if (date.toISOString().split('T')[0] === ovulationDate.toISOString().split('T')[0]) {
        return 'ovulation'
      }

      const fertStart = new Date(ovulationDate)
      fertStart.setDate(ovulationDate.getDate() - 3)
      const fertEnd = new Date(ovulationDate)
      fertEnd.setDate(ovulationDate.getDate() + 1)

      if (date >= fertStart && date <= fertEnd) return 'fertility'
    }

    return null
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
      
      <div className="flex justify-around mt-4 pb-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff4d6d]"></div> Период
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full border border-[#4caf50] border-dashed"></div> Овуляция
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6495ED]/30"></div> Прогноз
        </div>
      </div>
    </div>
  )
}
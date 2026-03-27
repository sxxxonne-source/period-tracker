"use client"

import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

// Определяем типы для Calendar, чтобы VS Code не ругался
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type Period = {
  start_date: string
  duration: number
}

export default function CycleCalendar() {
  const [periods, setPeriods] = useState<Period[]>([])
  
  // Инициализируем состояние с правильным типом
  const [value, setValue] = useState<Value>(new Date());

  useEffect(() => {
    fetchPeriods()
  }, [])

  async function fetchPeriods() {
    const userId = localStorage.getItem("telegram_user_id") || "test_user"
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)

    if (data) setPeriods(data)
  }

  // Обработчик изменения даты
  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateStr = date.toISOString().split('T')[0]
    const cycleLength = Number(localStorage.getItem("cycle_length")) || 28

    const isPeriod = periods.some(p => {
      const start = new Date(p.start_date)
      const end = new Date(start)
      end.setDate(start.getDate() + (p.duration - 1))
      return date >= start && date <= end
    })
    if (isPeriod) return 'period'

    if (periods.length > 0) {
      const lastPeriod = new Date(periods[0].start_date)
      const nextPeriod = new Date(lastPeriod)
      nextPeriod.setDate(lastPeriod.getDate() + cycleLength)

      const ovulationDate = new Date(nextPeriod)
      ovulationDate.setDate(ovulationDate.getDate() - 14)
      const ovuStr = ovulationDate.toISOString().split('T')[0]

      if (dateStr === ovuStr) return 'ovulation'

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
        onChange={handleDateChange}
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
          <div className="w-2 h-2 rounded-full bg-[#6495ED]/30"></div> Фертильность
        </div>
      </div>
    </div>
  )
}
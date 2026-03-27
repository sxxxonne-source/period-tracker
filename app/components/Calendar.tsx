"use client"

import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

// Определяем типы для Calendar
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
    // Выполняется только на клиенте
    if (typeof window !== "undefined") {
      const savedCycle = localStorage.getItem("cycle_length");
      if (savedCycle) setCycleLength(Number(savedCycle));
      fetchPeriods();
    }
  }, [])

  async function fetchPeriods() {
    // Безопасно берем ID из localStorage
    const userId = (typeof window !== "undefined" && localStorage.getItem("telegram_user_id")) || "test_user"
    
    const { data } = await supabase
      .from("periods")
      .select("start_date, duration")
      .eq("user_id", userId)

    if (data) setPeriods(data)
  }

  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateStr = date.toISOString().split('T')[0]
    
    // Используем cycleLength из состояния, чтобы не дергать localStorage при каждом рендере плитки
    const currentCycleLength = cycleLength;

    const isPeriod = periods.some(p => {
      const start = new Date(p.start_date)
      const end = new Date(start)
      end.setDate(start.getDate() + (p.duration - 1))
      return date >= start && date <= end
    })
    
    if (isPeriod) return 'period'

    if (periods.length > 0) {
      // Берем самый свежий период (обычно первый в массиве, если сортировка верная)
      const lastPeriod = new Date(periods[0].start_date)
      const nextPeriod = new Date(lastPeriod)
      nextPeriod.setDate(lastPeriod.getDate() + currentCycleLength)

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
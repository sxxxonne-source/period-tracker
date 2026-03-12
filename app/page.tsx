import Link from "next/link"
import CycleCalendar from "./components/Calendar"

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Отслеживание цикла</h1>

      <p>Следующая менструация: 7 дней</p>
      <p>Овуляция: 15 дней</p>

      <CycleCalendar />

      <br />

      <Link href="/add-period">
        <button>Добавить период</button>
      </Link>

      <br /><br />

      <Link href="/history">
        <button>История</button>
      </Link>
    </main>
  )
}
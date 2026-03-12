export default function Onboarding() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Добро пожаловать</h1>

      <p>Продолжительность цикла</p>
      <input type="number" placeholder="28 дней" />

      <p>Последний период</p>
      <input type="date" />

      <br /><br />

      <button>Продолжить</button>
    </main>
  )
}
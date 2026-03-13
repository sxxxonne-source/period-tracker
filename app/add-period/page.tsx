export default function AddPeriod() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Добавить период</h1>

      <p>Дата начала</p>
      <input type="date" />

      <p>Дата окончания</p>
      <input type="date" />

      <br /><br />

      <button>Сохранить</button>
    </main>
  )
}
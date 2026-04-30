import "../styles/home.css"

export default function Home() {
  return (
    <section className="home_page page_screen" aria-label="주합 홈">
      <header className="home_header">
        <h1>Hi 주합러!</h1>
        <button className="notice_button" type="button">
          알림
        </button>
      </header>
      <div className="home_placeholder">홈 화면</div>
    </section>
  )
}

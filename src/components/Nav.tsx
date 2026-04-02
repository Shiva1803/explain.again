interface NavProps {
  count: number
}

export default function Nav({ count }: NavProps) {
  return (
    <header className="nav">
      <div className="nav-logo">explain.again</div>

      <div className="nav-right">
        <div className="live-pill">
          <span className="live-dot" aria-hidden="true" />
          <span>live</span>
        </div>
        <div className="nav-count">{count.toLocaleString()} confessions</div>
      </div>
    </header>
  )
}

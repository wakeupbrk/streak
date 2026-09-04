export default function EpCard({
  number,
  img,
  minutes,
  title,
  vote,
  epNumber,
  active,
  onPlay,
}) {
  return (
    <button
      type="button"
      className={active ? 'EPCard is-active' : 'EPCard'}
      onClick={() => onPlay?.(epNumber || number)}
    >
      <p style={{ margin: 0, fontSize: 'smaller', color: 'dimgray' }}>
        Ep {number} • {minutes || '?'}mins • {String(vote || 0).slice(0, 3)}/10
      </p>
      {img ? <img src={img} alt={title} /> : <div className="epPlaceholder" />}
      <p style={{ margin: 0 }}>{title}</p>
    </button>
  )
}

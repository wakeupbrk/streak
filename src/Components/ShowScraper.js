import EmbedPlayer from './EmbedPlayer'

export default function ShowScraper({
  id,
  s,
  e,
  title,
  poster,
  backdrop,
  episodeTitle,
  startAt,
  onEnded,
  onNext,
}) {
  return (
    <EmbedPlayer
      type="tv"
      id={id}
      season={s}
      episode={e}
      title={title}
      poster={poster}
      backdrop={backdrop}
      episodeTitle={episodeTitle}
      startAt={startAt}
      onEnded={onEnded}
      onNext={onNext}
    />
  )
}

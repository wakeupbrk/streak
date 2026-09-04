import EmbedPlayer from './EmbedPlayer'

export default function MovieScraper({ id, title, poster, backdrop, startAt }) {
  return (
    <EmbedPlayer
      type="movie"
      id={id}
      title={title}
      poster={poster}
      backdrop={backdrop}
      startAt={startAt}
    />
  )
}

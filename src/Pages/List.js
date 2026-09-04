import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../Components/Loading'
import Nav from '../Components/Nav'
import Footer from '../Components/Footer'
import { posterUrl, tmdb } from '../lib/tmdb'

export default function List() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const library = JSON.parse(localStorage.getItem('library') || '[]')
    if (!library.length) return undefined
    let cancelled = false
    Promise.all(
      library.map(async (path) => {
        try {
          const data = await tmdb(path)
          return { path, data }
        } catch {
          return null
        }
      })
    ).then((rows) => {
      if (!cancelled) setItems(rows.filter(Boolean))
    })
    return () => {
      cancelled = true
    }
  }, [])

  function remove(path) {
    const library = (JSON.parse(localStorage.getItem('library') || '[]') || []).filter(
      (item) => item !== path
    )
    localStorage.setItem('library', JSON.stringify(library))
    setItems((current) => current.filter((item) => item.path !== path))
  }

  return (
    <>
      <Loading />
      <Nav />
      <div style={{ margin: '1vh' }}>
        <h3 style={{ marginLeft: '2vh' }}>My List</h3>
        <div className="Cards">
          {!items.length && (
            <p style={{ margin: '2vh', color: 'gray' }}>Nothing saved yet. Add titles from a movie or show page.</p>
          )}
          {items.map(({ path, data }) => {
            const isMovie = path.includes('movie')
            return (
              <div className="ListCardWrap" key={path}>
                <Link to={path}>
                  <div className="ListCard">
                    <div
                      className="background-image"
                      style={{
                        backgroundImage: `url(${posterUrl(data.backdrop_path || data.poster_path, 'w780')})`,
                      }}
                    />
                    <img src={posterUrl(data.poster_path)} alt="" />
                    <div>
                      <p>{isMovie ? 'Movie' : 'TV Show'}</p>
                      <h3>{isMovie ? data.title : data.name}</h3>
                      <h5>⭐️ {data.vote_average}/10</h5>
                      <h5>{isMovie ? data.release_date : data.first_air_date}</h5>
                    </div>
                  </div>
                </Link>
                <button type="button" className="listRemove" onClick={() => remove(path)}>
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <Footer />
    </>
  )
}

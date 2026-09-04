import { useEffect, useState } from 'react'
import Loading from '../Components/Loading'
import Nav from '../Components/Nav'
import Icon from '../Components/icon.png'
import Footer from '../Components/Footer'
import { toast } from 'react-hot-toast'
import { clearContinueWatching } from '../lib/continueWatching'

export default function Settings() {
  const [lastMessage, setLastMessage] = useState('')
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(() => {
    fetch('https://api.github.com/repos/wakeupbrk/streak/commits')
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || !data[0]) return
        setLastMessage(`Updates: ${data[0].commit.message}, done by ${data[0].commit.committer.name}`)
        setLastUpdate(new Date(data[0].commit.committer.date).toLocaleString())
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <Loading />
      <Nav />
      <div>
        <div className="webappDetails">
          <img src={Icon} alt="Streak" />
          <h3 style={{ margin: '1vh' }}>Streak</h3>
          <h4>TV Shows & Movies streaming webapp.</h4>
          <h5 style={{ margin: '5px' }}>
            Originally by{' '}
            <font
              style={{ color: '#ff742d' }}
              onClick={() => window.open('https://github.com/m2ncef/Streak', '_blank')}
            >
              moncef
            </font>
            . Player + continue watching fix on{' '}
            <font
              style={{ color: '#ff742d' }}
              onClick={() => window.open('https://github.com/wakeupbrk/streak', '_blank')}
            >
              wakeupbrk/streak
            </font>
            .
          </h5>
          <br />
          <div style={{ color: 'gray', margin: '2vh 0vh -2vh 0vh', fontSize: 'small', textAlign: 'center' }}>
            <p style={{ lineHeight: '2vh', margin: '1vh 3vh' }}>
              {lastMessage} {lastUpdate && `at ${lastUpdate}`}
            </p>
          </div>
        </div>
        <div className="infosContainer">
          <h2 style={{ margin: '2vh' }}>Credits</h2>
          <p style={{ margin: '0vh 2vh' }}>APIs Used</p>
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB (titles, images, trending)
          </a>
          <a href="https://github.com/m2ncef/Streak" target="_blank" rel="noreferrer">
            Original Streak UI
          </a>
          <p>
            Streak does not host any files, it merely links to 3rd party services. Legal issues should
            be taken up with the file hosts and providers. Streak is not responsible for any media files
            shown by the video providers.
          </p>
        </div>
        <div className="settingsList">
          <h4
            onClick={() => {
              localStorage.removeItem('library')
              toast.success('Library cleared')
            }}
          >
            Clear Library
          </h4>
          <h4
            onClick={() => {
              clearContinueWatching()
              toast.success('Continue watching cleared')
            }}
          >
            Clear Continue Watching
          </h4>
        </div>
      </div>
      <Footer />
    </>
  )
}

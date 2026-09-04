import { EmojiButton } from '@joeattardi/emoji-button'
import { useEffect } from 'react'
import Footer from '../Components/Footer'
import { useNavigate } from 'react-router-dom'
import toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

function notify(text) {
  toastify({
    text,
    duration: 3000,
    gravity: 'top',
    position: 'center',
    stopOnFocus: true,
    style: {
      background: 'white',
      color: 'black',
      borderRadius: '1vh',
    },
  }).showToast()
}

export default function Login() {
  const navigate = useNavigate()
  const hasPin = Boolean(localStorage.getItem('UserPIN'))

  function startWatching() {
    const pin = document.querySelector('.User input')?.value || ''
    if (pin.length === 4 && localStorage.getItem('UserEmoji')) {
      document.querySelector('.User h1').style.border = '1px solid green'
      document.querySelector('.User input').style.border = '1px solid green'
      localStorage.setItem('UserPIN', pin)
      sessionStorage.setItem('L', true)
      setTimeout(() => navigate('/'), 500)
    } else if (!localStorage.getItem('UserEmoji')) {
      notify('Select Your Emoji.')
      document.querySelector('.User h1').style.border = '1px solid red'
    } else {
      notify('Enter a 4 digits pin for your profile.')
      document.querySelector('.User input').style.border = '1px solid red'
    }
  }

  function login() {
    const pin = document.querySelector('.User input')?.value
    if (pin === localStorage.getItem('UserPIN') && localStorage.getItem('UserEmoji')) {
      document.querySelector('.User input').style.border = '1px solid green'
      document.querySelector('.User h1').style.border = '1px solid green'
      sessionStorage.clear()
      setTimeout(() => navigate('/'), 500)
    } else {
      document.querySelector('.User input').style.border = '1px solid red'
      notify('Incorrect PIN, Try again.')
    }
  }

  useEffect(() => {
    if (hasPin) return undefined
    const picker = new EmojiButton()
    const trigger = document.querySelector('.trigger')
    picker.on('emoji', (selection) => {
      trigger.innerHTML = selection.emoji
      localStorage.setItem('UserEmoji', selection.emoji)
    })
    const open = () => picker.togglePicker(trigger)
    trigger?.addEventListener('click', open)
    return () => trigger?.removeEventListener('click', open)
  }, [hasPin])

  if (!hasPin) {
    return (
      <div className="loginContainer">
        <div className="User">
          <p style={{ marginBottom: '5vh' }}>Create Your Watching Profile</p>
          <h1 className="trigger">🧑🏻‍🦱</h1>
          <input type="password" maxLength={4} placeholder="4 Digits Code" id="pinCode" />
          <button type="button" onClick={startWatching}>
            Start Watching
          </button>
        </div>
        <Footer style={{ position: 'fixed', bottom: 0 }} />
      </div>
    )
  }

  return (
    <div className="loginContainer">
      <div className="User">
        <p style={{ marginBottom: '5vh' }}>Login to your profile</p>
        <h1>{localStorage.getItem('UserEmoji')}</h1>
        <input type="password" maxLength={4} placeholder="Your PIN" id="pinCode" />
        <button type="button" onClick={login}>
          Start Watching
        </button>
        <p
          id="createNewProfile"
          onClick={() => {
            localStorage.removeItem('UserPIN')
            localStorage.removeItem('UserEmoji')
            sessionStorage.clear()
            window.location.reload()
          }}
        >
          Forgot PIN?
        </p>
      </div>
      <Footer style={{ position: 'fixed', bottom: 0 }} />
    </div>
  )
}

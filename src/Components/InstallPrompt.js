import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  useEffect(() => {
    const capture = (event) => { event.preventDefault(); setPrompt(event) }
    window.addEventListener('beforeinstallprompt', capture)
    return () => window.removeEventListener('beforeinstallprompt', capture)
  }, [])
  if (!prompt) return null
  return <button className="installPrompt" type="button" onClick={async () => { await prompt.prompt(); setPrompt(null) }}><i className="fa fa-download" /> Install Streak</button>
}

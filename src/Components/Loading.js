import { useEffect } from 'react'
import logo from './icon.png'
import Footer from './Footer'

export default function Loading({ time = 900 }) {
  useEffect(() => {
    const node = document.querySelector('.Loader')
    if (!node) return undefined
    node.style.opacity = '1'
    node.style.zIndex = '999999'
    const timer = setTimeout(() => {
      node.style.opacity = '0'
      node.style.zIndex = '-1'
    }, time)
    return () => clearTimeout(timer)
  }, [time])

  return (
    <div className="Loader">
      <img src={logo} alt="Loader icon" />
      <Footer style={{ bottom: 0, position: 'fixed' }} />
    </div>
  )
}

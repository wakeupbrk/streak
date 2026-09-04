import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './Pages/Home'
import Error from './Pages/404'
import Movie from './Pages/Movie'
import Show from './Pages/Show'
import List from './Pages/List'
import Explore from './Pages/Explore'
import { useEffect } from 'react'
import Login from './Pages/Login'
import Settings from './Pages/Settings'

export default function App() {
  useEffect(() => {
    document.title = 'Streak'
  }, [])
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/list" element={<List />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/movie/:id" element={<Movie />} />
        <Route path="/tv/:id" element={<Show />} />
        <Route path="/movie/" element={<Explore type="movie" />} />
        <Route path="/tv/" element={<Explore type="tv" />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  )
}

import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="bottomNav" aria-label="Primary">
      <NavLink to="/" end><i className="fa fa-home" /><span>Home</span></NavLink>
      <NavLink to="/movie"><i className="fa fa-film" /><span>Movies</span></NavLink>
      <NavLink to="/tv"><i className="fa fa-television" /><span>Shows</span></NavLink>
      <NavLink to="/list"><i className="fa fa-bookmark" /><span>My List</span></NavLink>
    </nav>
  )
}

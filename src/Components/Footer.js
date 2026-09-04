export default function Footer(props) {
  return (
    <div style={props.style}>
      <p style={{ textAlign: 'center', padding: '1vh' }}>
        based on{' '}
        <a
          href="https://github.com/m2ncef/Streak"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none', color: 'skyblue' }}
        >
          Streak by moncef
        </a>
      </p>
    </div>
  )
}

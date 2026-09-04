# Streak 🔥📺

Movies/TV streaming web app. Forked from [m2ncef/Streak](https://github.com/m2ncef/Streak) and fixed so the player actually opens.

This copy adds **Continue Watching**, a working 16:9 player, and a source switcher. Metadata still comes from TMDB. Playback is third-party embeds — Streak does not host files.

## What was broken

The original player stayed on a loading screen forever (`loading` never flipped to `false`) and the iframe had no height even if it had loaded. Explore search used a broken TMDB query. Login sent you to a route that did not exist.

## Run

```bash
cd streak
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env` and set your own TMDB v3 key. A public demo key is already in the app so it runs without one.

```bash
npm run build
```

## Continue watching

Opening Play on a movie or episode writes that title into local storage. Home shows a **Continue Watching** row. Resume opens the same title (and last season/episode for shows). Progress is stored when the embed posts `MEDIA_DATA` / `PLAYER_EVENT` (VidLink and similar). Use **Next source** if one embed is dead.

# Disclaimer

1. Educational / personal use.
2. Streak does not host any files. It links to third-party services. Legal issues belong with the file hosts and providers.
3. Streak is not responsible for media shown by those providers.

## Original

UI and concept by [moncef](https://github.com/m2ncef/Streak).

import { useState, useEffect, useRef } from 'react'

const DEFAULT_TRACKS = [
  { id:'kXYiU_JCYtU', title:'Numb',             artist:'Linkin Park', dur:'3:07' },
  { id:'eVTXPUF4Oz4', title:'In the End',        artist:'Linkin Park', dur:'3:36' },
  { id:'fJ9rUzIMcZQ', title:'Bohemian Rhapsody', artist:'Queen',       dur:'5:55' },
  { id:'_FrOQC-zEog', title:'Comfortably Numb',  artist:'Pink Floyd',  dur:'6:23' },
  { id:'gGdGFtwCNBE', title:'Mr. Brightside',    artist:'The Killers', dur:'3:42' },
  { id:'djV11Xbc914', title:'Take On Me',         artist:'a-ha',       dur:'3:46' },
]

function parseVideoId(raw) {
  const s = raw.trim()
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|music\.youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  return null
}

async function fetchMeta(id) {
  const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
  if (!r.ok) throw new Error('not found')
  const d = await r.json()
  let title = d.title, artist = d.author_name
  const dash = title.match(/^(.+?)\s[–\-]\s(.+)$/)
  if (dash) { artist = dash[1].trim(); title = dash[2].trim() }
  return { title, artist }
}

export default function MusicWidget({ editMode }) {
  const [tracks, setTracks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sp-tracks')) || DEFAULT_TRACKS }
    catch { return DEFAULT_TRACKS }
  })
  const [idx, setIdx]           = useState(0)
  const [playing, setPlaying]   = useState(false)
  const [flipped, setFlipped]   = useState(false)
  const [url, setUrl]           = useState('')
  const [fetching, setFetching] = useState(false)
  const [err, setErr]           = useState('')
  const [hov, setHov]           = useState(null)

  const playerElRef  = useRef(null)
  const playerRef    = useRef(null)
  const readyRef     = useRef(false)
  const idxRef       = useRef(idx)
  const tracksRef    = useRef(tracks)
  const playingRef   = useRef(playing)

  useEffect(() => { idxRef.current = idx },         [idx])
  useEffect(() => { tracksRef.current = tracks },   [tracks])
  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => {
    try { localStorage.setItem('sp-tracks', JSON.stringify(tracks)) } catch {}
  }, [tracks])

  useEffect(() => { if (!editMode) setFlipped(false) }, [editMode])

  // Boot YouTube IFrame API
  useEffect(() => {
    const boot = () => {
      if (!playerElRef.current || playerRef.current) return
      playerRef.current = new window.YT.Player(playerElRef.current, {
        height: '1', width: '1',
        videoId: DEFAULT_TRACKS[0].id,
        playerVars: { autoplay: 0, controls: 0, rel: 0, enablejsapi: 1 },
        events: {
          onReady: () => { readyRef.current = true },
          onStateChange: (e) => {
            const YT = window.YT.PlayerState
            if (e.data === YT.PLAYING) { setPlaying(true)  }
            if (e.data === YT.PAUSED)  { setPlaying(false) }
            if (e.data === YT.ENDED) {
              const next = (idxRef.current + 1) % tracksRef.current.length
              setIdx(next)
              playerRef.current.loadVideoById(tracksRef.current[next].id)
              playerRef.current.playVideo()
              setPlaying(true)
            }
          },
        },
      })
    }
    if (window.YT?.Player) { boot() }
    else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { prev?.(); boot() }
      if (!document.getElementById('yt-api')) {
        const s = document.createElement('script')
        s.id = 'yt-api'
        s.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(s)
      }
    }
  }, [])

  // ── Transport controls ─────────────────────────────────
  const togglePlay = () => {
    if (!readyRef.current) return
    if (playing) { playerRef.current.pauseVideo() }
    else {
      playerRef.current.loadVideoById(tracks[idx].id)
      playerRef.current.playVideo()
    }
  }

  const skipTo = (newIdx) => {
    setIdx(newIdx)
    if (readyRef.current) {
      playerRef.current.loadVideoById(tracks[newIdx].id)
      if (playingRef.current) playerRef.current.playVideo()
    }
  }

  const selectTrack = (i) => {
    setIdx(i)
    if (readyRef.current) {
      playerRef.current.loadVideoById(tracks[i].id)
      playerRef.current.playVideo()
      setPlaying(true)
    }
  }

  // ── Playlist editing ───────────────────────────────────
  const addTrack = async (e) => {
    e.preventDefault()
    setErr('')
    const id = parseVideoId(url)
    if (!id) return setErr('Paste a valid YouTube or YouTube Music link.')
    if (tracks.find(t => t.id === id)) return setErr('Already in your playlist.')
    setFetching(true)
    try {
      const meta = await fetchMeta(id)
      setTracks(t => [...t, { id, ...meta, dur: '—' }])
      setUrl('')
    } catch { setErr('Could not load that video.') }
    finally { setFetching(false) }
  }

  const removeTrack = (i) => {
    setTracks(t => t.filter((_, j) => j !== i))
    if (idx >= i && idx > 0) setIdx(idx - 1)
  }

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= tracks.length) return
    const t = [...tracks]
    ;[t[i], t[j]] = [t[j], t[i]]
    setTracks(t)
    if (idx === i) setIdx(j)
    else if (idx === j) setIdx(i)
  }

  return (
    <div style={{ height:'100%', position:'relative', perspective:'1200px' }}>

      {/* Hidden YT player */}
      <div style={{ position:'absolute', width:1, height:1, opacity:0, overflow:'hidden', pointerEvents:'none' }}>
        <div ref={playerElRef} />
      </div>

      {/* Flip container */}
      <div style={{
        width:'100%', height:'100%',
        transformStyle:'preserve-3d',
        transition:'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
        transform: flipped ? 'rotateY(180deg)' : 'none',
        position:'relative',
      }}>

        {/* ── FRONT ── */}
        <div style={{ ...face }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <Label>Playlist</Label>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {editMode && (
                <button onClick={() => setFlipped(true)} style={iconBtn} title="Edit playlist">✎</button>
              )}
            </div>
          </div>

          {/* Now playing */}
          <div style={{ flexShrink:0, textAlign:'center', padding:'6px 0 2px' }}>
            <div style={{ fontSize:'0.92rem', fontWeight:600, color:'#fff',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {tracks[idx]?.title || '—'}
            </div>
            <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginTop:2 }}>
              {tracks[idx]?.artist || ''}
            </div>
          </div>

          {/* Transport */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, flexShrink:0 }}>
            <button onClick={() => skipTo((idx - 1 + tracks.length) % tracks.length)} style={ctrlBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button onClick={togglePlay} style={{ ...ctrlBtn, width:42, height:42,
              background:'rgba(255,255,255,0.1)', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.15)' }}>
              {playing
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <button onClick={() => skipTo((idx + 1) % tracks.length)} style={ctrlBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
            </button>
          </div>

          {/* Track list */}
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2, minHeight:0 }}>
            {tracks.map((t, i) => (
              <div key={t.id}
                onClick={() => selectTrack(i)}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                style={{
                  display:'flex', alignItems:'center', gap:8, padding:'6px 8px',
                  borderRadius:8, cursor:'pointer', transition:'all 0.12s',
                  background: idx===i ? 'rgba(255,255,255,0.07)' : hov===i ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border:`1px solid ${idx===i ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                }}>
                <span style={{ width:16, fontSize:'0.65rem', flexShrink:0, textAlign:'center',
                  color: idx===i && playing ? 'var(--accent)' : 'var(--muted)', fontWeight:700 }}>
                  {idx===i && playing ? '♫' : i+1}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.75rem', fontWeight: idx===i ? 600 : 400,
                    color: idx===i ? '#fff' : '#d4d4d8',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize:'0.62rem', color:'var(--muted)' }}>{t.artist}</div>
                </div>
                <span style={{ fontSize:'0.6rem', color:'var(--muted)', flexShrink:0, fontVariantNumeric:'tabular-nums' }}>
                  {t.dur}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{ ...face, transform:'rotateY(180deg)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <Label>Edit Playlist</Label>
            <button onClick={() => setFlipped(false)} style={iconBtn}>✕</button>
          </div>

          <form onSubmit={addTrack} style={{ display:'flex', gap:6, flexShrink:0 }}>
            <input value={url} onChange={e => { setUrl(e.target.value); setErr('') }}
              placeholder="YouTube Music link…"
              style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:7, padding:'6px 10px', fontSize:'0.73rem', color:'var(--text)',
                fontFamily:'var(--font)', outline:'none' }}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
            <button type="submit" disabled={fetching} style={{ ...iconBtn, padding:'0 12px', opacity: fetching ? 0.5 : 1 }}>
              {fetching ? '…' : '+'}
            </button>
          </form>

          {err
            ? <p style={{ fontSize:'0.63rem', color:'#f87171', flexShrink:0 }}>{err}</p>
            : <p style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.18)', flexShrink:0, lineHeight:1.5 }}>
                Paste a YouTube Music or YouTube link. Title &amp; artist are pulled automatically.
              </p>
          }

          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:4, minHeight:0 }}>
            {tracks.map((t, i) => (
              <div key={t.id} style={{
                display:'flex', alignItems:'center', gap:5, padding:'6px 8px',
                borderRadius:8, background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#d4d4d8',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize:'0.6rem', color:'var(--muted)' }}>{t.artist}</div>
                </div>
                <button onClick={() => move(i, -1)} disabled={i===0} style={miniBtn}>↑</button>
                <button onClick={() => move(i,  1)} disabled={i===tracks.length-1} style={miniBtn}>↓</button>
                <button onClick={() => removeTrack(i)} style={{ ...miniBtn, color:'#f87171' }}>✕</button>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`@keyframes pulse { 50%{opacity:.4} }`}</style>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────
const face = {
  position:'absolute', inset:0,
  backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
  display:'flex', flexDirection:'column',
  padding:'14px', gap:10, overflow:'hidden',
}

function Label({ children }) {
  return <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.1em',
    color:'var(--muted)', fontWeight:600, opacity:.75 }}>{children}</div>
}

const iconBtn = {
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:6, color:'var(--muted)', fontSize:'0.8rem', cursor:'pointer',
  padding:'4px 8px', fontFamily:'var(--font)', transition:'all 0.2s',
}

const ctrlBtn = {
  background:'none', border:'none', color:'var(--text)', cursor:'pointer',
  padding:0, display:'flex', alignItems:'center', justifyContent:'center',
  width:32, height:32, borderRadius:'50%', transition:'background 0.2s',
  flexShrink:0,
}

const miniBtn = {
  background:'none', border:'none', color:'var(--muted)', fontSize:'0.72rem',
  cursor:'pointer', padding:'2px 5px', borderRadius:4, fontFamily:'var(--font)',
  transition:'color 0.15s', flexShrink:0,
}

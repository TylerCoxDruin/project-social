import { useState } from 'react'

const TRACKS = [
  { title:'Numb',              artist:'Linkin Park',   id:'kXYiU_JCYtU', dur:'3:07' },
  { title:'In the End',        artist:'Linkin Park',   id:'eVTXPUF4Oz4', dur:'3:36' },
  { title:'Bohemian Rhapsody', artist:'Queen',         id:'fJ9rUzIMcZQ', dur:'5:55' },
  { title:'Comfortably Numb',  artist:'Pink Floyd',    id:'_FrOQC-zEog', dur:'6:23' },
  { title:'Mr. Brightside',    artist:'The Killers',   id:'gGdGFtwCNBE', dur:'3:42' },
  { title:'Take On Me',        artist:'a-ha',          id:'djV11Xbc914', dur:'3:46' },
]

export default function MusicWidget() {
  const [playing, setPlaying] = useState(null)
  const [hov, setHov]         = useState(null)

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px', gap:10, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <Label>Playlist</Label>
        <span style={{ fontSize:'0.62rem', color:'var(--muted)' }}>{TRACKS.length} tracks</span>
      </div>

      {playing !== null && (
        <div style={{ borderRadius:10, overflow:'hidden', flexShrink:0,
          border:'1px solid rgba(255,255,255,0.08)' }}>
          <iframe key={TRACKS[playing].id}
            src={`https://www.youtube.com/embed/${TRACKS[playing].id}?autoplay=1&rel=0&modestbranding=1`}
            title={TRACKS[playing].title} allow="autoplay;encrypted-media"
            style={{ width:'100%', height:100, border:'none', display:'block' }}/>
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
        {TRACKS.map((t,i) => (
          <div key={i}
            onClick={() => setPlaying(playing===i ? null : i)}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{
              display:'flex', alignItems:'center', gap:9, padding:'7px 9px', borderRadius:8,
              cursor:'pointer', transition:'all 0.15s',
              background: playing===i ? 'rgba(255,255,255,0.06)' : hov===i ? 'rgba(255,255,255,0.03)' : 'transparent',
              border:`1px solid ${playing===i ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
            }}>
            <div style={{
              width:20, height:20, borderRadius:'50%', flexShrink:0,
              background: playing===i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.55rem', color: playing===i ? '#fff' : 'var(--muted)', fontWeight:700,
            }}>
              {playing===i ? '▶' : i+1}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'0.78rem', fontWeight: playing===i ? 600 : 400,
                color: playing===i ? '#fff' : '#d4d4d8',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {t.title}
              </div>
              <div style={{ fontSize:'0.65rem', color:'var(--muted)' }}>{t.artist}</div>
            </div>
            <span style={{ fontSize:'0.62rem', color:'var(--muted)', flexShrink:0, fontVariantNumeric:'tabular-nums' }}>
              {t.dur}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.1em',
    color:'var(--muted)', fontWeight:600, opacity:.75 }}>{children}</div>
}

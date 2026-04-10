import { useState, useEffect, useRef } from 'react'

const PHOTOS = [
  { url:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80', caption:'Circuit dreams'    },
  { url:'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80', caption:'Into the matrix'   },
  { url:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80', caption:'Late night code'   },
  { url:'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=900&q=80', caption:'Tools of the trade'},
  { url:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80', caption:'Data streams'      },
]

export default function GalleryWidget() {
  const [cur, setCur] = useState(0)
  const [auto, setAuto] = useState(true)
  const ref = useRef()

  useEffect(() => {
    if (!auto) return
    ref.current = setInterval(() => setCur(c => (c+1) % PHOTOS.length), 3500)
    return () => clearInterval(ref.current)
  }, [auto])

  const go = d => { setAuto(false); setCur(c => (c+d+PHOTOS.length) % PHOTOS.length) }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, position:'relative', overflow:'hidden', minHeight:0 }}>
        {PHOTOS.map((p,i) => (
          <div key={i} style={{ position:'absolute', inset:0, opacity:i===cur?1:0,
            transition:'opacity 0.6s ease', pointerEvents:i===cur?'auto':'none' }}>
            <img src={p.url} alt={p.caption}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            <div style={{ position:'absolute', bottom:0, left:0, right:0,
              padding:'28px 14px 12px',
              background:'linear-gradient(transparent,rgba(0,0,0,0.6))' }}>
              <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.85)', fontWeight:500 }}>
                {p.caption}
              </span>
            </div>
          </div>
        ))}
        <NavBtn side="left"  onClick={() => go(-1)}>‹</NavBtn>
        <NavBtn side="right" onClick={() => go(1)}>›</NavBtn>
        <button onClick={() => setAuto(a=>!a)} style={{
          position:'absolute', top:10, right:10,
          padding:'3px 8px', borderRadius:6, cursor:'pointer', fontFamily:'var(--font)',
          fontSize:'0.58rem', fontWeight:600, letterSpacing:'0.08em',
          background: auto ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.45)',
          border:`1px solid ${auto ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.15)'}`,
          color: auto ? '#93c5fd' : 'rgba(255,255,255,0.45)',
        }}>{auto ? '⟳ AUTO' : '⏸ PAUSED'}</button>
      </div>

      <div style={{ display:'flex', gap:5, padding:'7px 10px', background:'rgba(0,0,0,0.3)', flexShrink:0, overflowX:'auto' }}>
        {PHOTOS.map((p,i) => (
          <div key={i} onClick={() => { setCur(i); setAuto(false) }}
            style={{ width:36, height:26, borderRadius:5, overflow:'hidden', cursor:'pointer', flexShrink:0,
              border:`1.5px solid ${i===cur ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              opacity: i===cur ? 1 : 0.55, transition:'all 0.2s' }}>
            <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavBtn({ side, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      position:'absolute', top:'50%', transform:'translateY(-50%)',
      [side]: 10, width:28, height:28, borderRadius:'50%',
      border:'1px solid rgba(255,255,255,0.18)', background:'rgba(0,0,0,0.5)',
      backdropFilter:'blur(4px)', color:'#fff', fontSize:'1rem', cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
    }}>{children}</button>
  )
}

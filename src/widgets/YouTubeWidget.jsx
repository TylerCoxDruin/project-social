import { useState } from 'react'

const PRESETS = [
  { id:'kXYiU_JCYtU', title:'Numb — Linkin Park'       },
  { id:'fJ9rUzIMcZQ', title:'Bohemian Rhapsody — Queen' },
  { id:'djV11Xbc914', title:'Take On Me — a-ha'         },
]

export default function YouTubeWidget() {
  const [vid, setVid]     = useState(PRESETS[0].id)
  const [input, setInput] = useState('')
  const [show, setShow]   = useState(false)

  const submit = e => {
    e.preventDefault()
    const m = input.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (m) { setVid(m[1]); setShow(false); setInput('') }
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px', gap:10, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <Label>YouTube</Label>
        <button onClick={() => setShow(s=>!s)} style={chip(show)}>
          {show ? '✕' : '+ URL'}
        </button>
      </div>

      {show && (
        <form onSubmit={submit} style={{ display:'flex', gap:6, flexShrink:0 }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            placeholder="Paste YouTube URL…"
            style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:7, padding:'5px 9px', fontSize:'0.73rem', color:'var(--text)',
              fontFamily:'var(--font)', outline:'none' }} />
          <button type="submit" style={chip(true, '#3b82f6')}>Go</button>
        </form>
      )}

      <div style={{ display:'flex', gap:5, flexWrap:'wrap', flexShrink:0 }}>
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => setVid(p.id)} style={chip(vid===p.id)}>
            {p.title.split(' — ')[0]}
          </button>
        ))}
      </div>

      <div style={{ flex:1, borderRadius:12, overflow:'hidden', background:'#000', minHeight:0 }}>
        <iframe key={vid} src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`}
          title="YouTube" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
          allowFullScreen style={{ width:'100%', height:'100%', border:'none', display:'block' }}/>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.1em',
    color:'var(--muted)', fontWeight:600, opacity:.75 }}>{children}</div>
}

function chip(active, color='#fff') {
  const rgb = color==='#3b82f6' ? '59,130,246' : '255,255,255'
  return {
    padding:'3px 9px', borderRadius:6, cursor:'pointer', fontFamily:'var(--font)',
    fontSize:'0.67rem', fontWeight:500, transition:'all 0.18s', whiteSpace:'nowrap',
    background: active ? `rgba(${rgb},0.12)` : 'rgba(255,255,255,0.03)',
    border: `1px solid rgba(${rgb},${active ? .35 : .08})`,
    color: active ? (color==='#3b82f6' ? '#93c5fd' : '#fff') : 'var(--muted)',
  }
}

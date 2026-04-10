import { useState, useEffect } from 'react'

const STATUSES = [
  { text:'Building something', color:'#3b82f6', rgb:'59,130,246' },
  { text:'In the zone',        color:'#22c55e', rgb:'34,197,94'  },
  { text:'Taking a break',     color:'#a855f7', rgb:'168,85,247' },
  { text:'Online',             color:'#22c55e', rgb:'34,197,94'  },
]

export default function BioWidget() {
  const [idx, setIdx] = useState(0)
  const [mood, setMood] = useState('✨ feeling inspired')

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % STATUSES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const s = STATUSES[idx]

  return (
    <div style={{ padding:'20px', height:'100%', display:'flex', flexDirection:'column', gap:12, overflow:'auto' }}>
      <p style={{ fontSize:'0.8rem', lineHeight:1.65, color:'#d4d4d8', flex:1 }}>
        Building things at the intersection of design and engineering.
        Into local LLMs, automation, 3D printing, and making the web feel alive. 🌐
      </p>

      <input
        value={mood} onChange={e => setMood(e.target.value)}
        placeholder="Current mood…" maxLength={60}
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:8, padding:'6px 10px', fontSize:'0.78rem', color:'var(--text)',
          fontFamily:'var(--font)', outline:'none', width:'100%' }}
        onFocus={e => e.target.style.borderColor='rgba(59,130,246,0.35)'}
        onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.08)'}
      />

      <div style={{ display:'inline-flex', alignItems:'center', gap:7,
        background:`rgba(${s.rgb},0.1)`, border:`1px solid rgba(${s.rgb},0.25)`,
        padding:'4px 11px', borderRadius:99, fontSize:'0.7rem', fontWeight:500,
        width:'fit-content', transition:'all 0.4s' }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:s.color,
          boxShadow:`0 0 7px ${s.color}`, animation:'pulse 2s infinite', flexShrink:0 }}/>
        <span style={{ color:s.color }}>{s.text}</span>
      </div>

      <style>{`@keyframes pulse { 50%{opacity:.4} }`}</style>
    </div>
  )
}

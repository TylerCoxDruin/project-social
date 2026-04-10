import { useState } from 'react'

const FRIENDS = [
  { name:'Alex R.',    emoji:'🦊', rgb:'249,115,22'  },
  { name:'Jamie L.',  emoji:'🌊', rgb:'6,182,212'   },
  { name:'Morgan K.', emoji:'🌙', rgb:'168,85,247'  },
  { name:'Casey T.',  emoji:'⚡',  rgb:'234,179,8'   },
  { name:'Riley P.',  emoji:'🎸', rgb:'236,72,153'  },
  { name:'Drew M.',   emoji:'🌿', rgb:'34,197,94'   },
  { name:'Sam B.',    emoji:'🔥', rgb:'239,68,68'   },
  { name:'Jordan V.', emoji:'🎨', rgb:'139,92,246'  },
]

export default function FriendsWidget() {
  const [hov, setHov] = useState(null)
  return (
    <div style={{ padding:'16px', height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
      <Label>Top Friends</Label>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, flex:1 }}>
        {FRIENDS.map((f,i) => (
          <div key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
            <div style={{
              width:'100%', aspectRatio:'1', borderRadius:12,
              background:`rgba(${f.rgb},0.1)`,
              border:`1px solid rgba(${f.rgb},${hov===i?.45:.15})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.3rem',
              transform: hov===i ? 'translateY(-2px) scale(1.05)' : 'none',
              boxShadow: hov===i ? `0 6px 18px rgba(${f.rgb},0.2)` : 'none',
              transition:'all 0.2s',
            }}>{f.emoji}</div>
            <span style={{ fontSize:'0.6rem', color: hov===i ? '#fff' : 'var(--muted)',
              transition:'color 0.2s', whiteSpace:'nowrap', textAlign:'center',
              overflow:'hidden', textOverflow:'ellipsis', width:'100%' }}>
              {f.name}
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

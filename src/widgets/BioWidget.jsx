import { useState, useEffect, useRef } from 'react'

const COLOR_SWATCHES = [
  { hex:'#22c55e', label:'Green'  },
  { hex:'#3b82f6', label:'Blue'   },
  { hex:'#f59e0b', label:'Amber'  },
  { hex:'#ef4444', label:'Red'    },
  { hex:'#a855f7', label:'Purple' },
  { hex:'#ec4899', label:'Pink'   },
  { hex:'#64748b', label:'Gray'   },
]

const MAX_LEN = 32

const hexToRgb = h => {
  const r = parseInt(h.slice(1,3),16)
  const g = parseInt(h.slice(3,5),16)
  const b = parseInt(h.slice(5,7),16)
  return `${r},${g},${b}`
}

const STORAGE_KEY = 'sp-status-v1'

function loadStatus() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (s && s.color && s.text) return s
  } catch {}
  return { color:'#22c55e', text:'Online' }
}

export default function BioWidget() {
  const [mood, setMood] = useState('✨ feeling inspired')
  const [status, setStatus] = useState(loadStatus)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]   = useState({ color:'#22c55e', text:'Online' })
  const panelRef = useRef(null)

  // persist status
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status))
  }, [status])

  // open editor — seed draft from current status
  const openEditor = () => {
    setDraft({ ...status })
    setEditing(true)
  }

  // close on outside click
  useEffect(() => {
    if (!editing) return
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setEditing(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [editing])

  const save = () => {
    setStatus({ color: draft.color, text: draft.text.trim() || 'Online' })
    setEditing(false)
  }

  const rgb = hexToRgb(status.color)

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

      {/* Status pill + inline editor */}
      <div ref={panelRef} style={{ display:'flex', flexDirection:'column', gap:8, width:'fit-content' }}>

        {/* Pill — click to edit */}
        <button
          onClick={openEditor}
          title="Customize status"
          style={{ display:'inline-flex', alignItems:'center', gap:7, cursor:'pointer',
            background:`rgba(${rgb},0.1)`, border:`1px solid rgba(${rgb},0.25)`,
            padding:'4px 11px', borderRadius:99, fontSize:'0.7rem', fontWeight:500,
            transition:'all 0.3s', fontFamily:'var(--font)', outline:'none' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:status.color,
            boxShadow:`0 0 7px ${status.color}`, animation:'pulse 2s infinite', flexShrink:0 }}/>
          <span style={{ color:status.color }}>{status.text}</span>
          <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.6rem', marginLeft:2 }}>✎</span>
        </button>

        {/* Inline editor */}
        {editing && (
          <div style={{ background:'rgba(24,24,27,0.95)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10,
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)', width:220 }}>

            {/* Color swatches */}
            <div>
              <p style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.1em',
                color:'rgba(255,255,255,0.35)', margin:'0 0 6px' }}>Color</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {COLOR_SWATCHES.map(sw => (
                  <button key={sw.hex} title={sw.label} onClick={() => setDraft(d => ({...d, color:sw.hex}))}
                    style={{ width:18, height:18, borderRadius:'50%', background:sw.hex, border:'none',
                      cursor:'pointer', outline: draft.color===sw.hex ? `2px solid ${sw.hex}` : '2px solid transparent',
                      outlineOffset:2, transition:'outline 0.15s', boxShadow: draft.color===sw.hex ? `0 0 6px ${sw.hex}` : 'none' }} />
                ))}
              </div>
            </div>

            {/* Message input */}
            <div>
              <p style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.1em',
                color:'rgba(255,255,255,0.35)', margin:'0 0 6px' }}>
                Message <span style={{ color:'rgba(255,255,255,0.2)', textTransform:'none', letterSpacing:0 }}>
                  ({draft.text.length}/{MAX_LEN})
                </span>
              </p>
              <input
                autoFocus
                value={draft.text}
                maxLength={MAX_LEN}
                onChange={e => setDraft(d => ({...d, text:e.target.value}))}
                onKeyDown={e => { if(e.key==='Enter') save(); if(e.key==='Escape') setEditing(false) }}
                placeholder="Online"
                style={{ width:'100%', background:'rgba(255,255,255,0.04)',
                  border:`1px solid rgba(255,255,255,0.1)`, borderRadius:7,
                  padding:'5px 9px', fontSize:'0.78rem', color:'var(--text)',
                  fontFamily:'var(--font)', outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='rgba(59,130,246,0.4)'}
                onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
              <button onClick={() => setEditing(false)}
                style={{ fontSize:'0.7rem', padding:'4px 10px', borderRadius:6, cursor:'pointer',
                  background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
                  color:'rgba(255,255,255,0.45)', fontFamily:'var(--font)' }}>
                Cancel
              </button>
              <button onClick={save}
                style={{ fontSize:'0.7rem', padding:'4px 10px', borderRadius:6, cursor:'pointer',
                  background:'var(--accent)', border:'none', color:'#fff', fontFamily:'var(--font)',
                  fontWeight:600 }}>
                Save
              </button>
            </div>

          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 50%{opacity:.4} }`}</style>
    </div>
  )
}

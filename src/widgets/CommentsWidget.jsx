import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'sp-comments-v1'
const OWNER_NAME  = 'Tyler'
const MAX_MSG     = 160
const MAX_NAME    = 24

function loadComments() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(s)) return s
  } catch {}
  return [
    { id:1, name:'Alex', text:'Dude this layout is sick 🔥', ts: Date.now() - 1000*60*14 },
    { id:2, name:'Tyler', text:'Thanks! Still tweaking it 😄', ts: Date.now() - 1000*60*11 },
    { id:3, name:'Jordan', text:'Love the widget vibe, very bento.', ts: Date.now() - 1000*60*3 },
  ]
}

function relTime(ts) {
  const d = (Date.now() - ts) / 1000
  if (d < 5)    return 'just now'
  if (d < 60)   return `${Math.floor(d)}s ago`
  if (d < 3600) return `${Math.floor(d/60)}m ago`
  if (d < 86400) return `${Math.floor(d/3600)}h ago`
  return new Date(ts).toLocaleDateString(undefined, { month:'short', day:'numeric' })
}

function Avatar({ name, size = 28 }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase()
  // deterministic hue from name
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  const hue = Math.abs(h) % 360
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`hsl(${hue},50%,32%)`, display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.36, fontWeight:700, color:`hsl(${hue},70%,85%)`, userSelect:'none' }}>
      {initials}
    </div>
  )
}

export default function CommentsWidget() {
  const [comments, setComments] = useState(loadComments)
  const [name, setName]         = useState('')
  const [text, setText]         = useState('')
  const [error, setError]       = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
  }, [comments])

  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [comments])

  const send = () => {
    const n = name.trim()
    const t = text.trim()
    if (!n) { setError('Enter your name'); return }
    if (!t) { setError('Say something!'); return }
    setError('')
    setComments(c => [...c, { id: Date.now(), name: n, text: t, ts: Date.now() }])
    setText('')
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  // Group consecutive messages from the same sender
  const grouped = comments.reduce((acc, msg, i) => {
    const prev = comments[i - 1]
    const isSame = prev && prev.name === msg.name
    if (!isSame) acc.push([msg])
    else acc[acc.length - 1].push(msg)
    return acc
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Header */}
      <div style={{ padding:'12px 16px 8px', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.06)',
        display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e',
          boxShadow:'0 0 6px #22c55e', flexShrink:0 }}/>
        <span style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--text)' }}>
          Leave a note
        </span>
        <span style={{ fontSize:'0.62rem', color:'var(--muted)', marginLeft:'auto' }}>
          {comments.length} message{comments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{ flex:1, overflowY:'auto', padding:'12px 14px',
        display:'flex', flexDirection:'column', gap:2,
        scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.1) transparent' }}>

        {grouped.map(group => {
          const isOwner = group[0].name.toLowerCase() === OWNER_NAME.toLowerCase()
          return (
            <div key={group[0].id} style={{ display:'flex', flexDirection:'column',
              alignItems: isOwner ? 'flex-end' : 'flex-start', marginBottom:8 }}>

              {/* Sender label */}
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4,
                flexDirection: isOwner ? 'row-reverse' : 'row' }}>
                <Avatar name={group[0].name} size={22} />
                <span style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.35)', fontWeight:500 }}>
                  {group[0].name}
                </span>
              </div>

              {/* Bubbles */}
              {group.map((msg, bi) => {
                const isLast  = bi === group.length - 1
                const isFirst = bi === 0
                // iMessage-style radius: sharp corner on "tail" side at bottom of last bubble
                let radius
                if (isOwner) {
                  radius = isLast ? '18px 4px 18px 18px' : '18px 8px 8px 18px'
                } else {
                  radius = isLast ? '4px 18px 18px 18px' : '8px 18px 18px 8px'
                }
                return (
                  <div key={msg.id} style={{ marginBottom: isLast ? 0 : 2,
                    maxWidth:'78%', display:'flex',
                    flexDirection: isOwner ? 'row-reverse' : 'row',
                    alignItems:'flex-end', gap:4 }}>
                    <div style={{
                      padding:'8px 12px',
                      borderRadius: radius,
                      background: isOwner ? '#2563eb' : 'rgba(255,255,255,0.1)',
                      color: isOwner ? '#fff' : '#e4e4e7',
                      fontSize:'0.8rem', lineHeight:1.5,
                      wordBreak:'break-word',
                      boxShadow: isOwner
                        ? '0 2px 12px rgba(37,99,235,0.3)'
                        : '0 1px 4px rgba(0,0,0,0.25)',
                    }}>
                      {msg.text}
                    </div>
                    {isLast && (
                      <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.2)',
                        flexShrink:0, paddingBottom:2 }}>
                        {relTime(msg.ts)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Input area */}
      <div style={{ flexShrink:0, borderTop:'1px solid rgba(255,255,255,0.07)',
        padding:'10px 12px', display:'flex', flexDirection:'column', gap:6,
        background:'rgba(0,0,0,0.15)' }}>

        {error && (
          <span style={{ fontSize:'0.65rem', color:'#ef4444', paddingLeft:2 }}>{error}</span>
        )}

        <div style={{ display:'flex', gap:6 }}>
          {/* Name */}
          <input
            value={name} onChange={e => { setName(e.target.value.slice(0, MAX_NAME)); setError('') }}
            placeholder="Your name"
            style={{ width:100, flexShrink:0, ...inputStyle }}
          />
          {/* Message */}
          <input
            value={text}
            onChange={e => { setText(e.target.value.slice(0, MAX_MSG)); setError('') }}
            onKeyDown={onKey}
            placeholder={`Message… (${MAX_MSG} chars)`}
            style={{ flex:1, ...inputStyle }}
          />
          {/* Send button */}
          <button onClick={send} title="Send"
            style={{ width:34, height:34, borderRadius:'50%', border:'none',
              background: text.trim() && name.trim() ? '#2563eb' : 'rgba(255,255,255,0.08)',
              cursor: text.trim() && name.trim() ? 'pointer' : 'default',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'background 0.2s',
              boxShadow: text.trim() && name.trim() ? '0 0 10px rgba(37,99,235,0.4)' : 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.18)' }}>
            {text.length}/{MAX_MSG}
          </span>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  background:'rgba(255,255,255,0.05)',
  border:'1px solid rgba(255,255,255,0.09)',
  borderRadius:20,
  padding:'7px 12px',
  fontSize:'0.78rem',
  color:'var(--text)',
  fontFamily:'var(--font)',
  outline:'none',
  height:34,
  boxSizing:'border-box',
}

import { useState, useCallback } from 'react'
import { ResponsiveGridLayout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './index.css'

import AvatarWidget    from './widgets/AvatarWidget'
import BioWidget       from './widgets/BioWidget'
import FriendsWidget   from './widgets/FriendsWidget'
import YouTubeWidget   from './widgets/YouTubeWidget'
import GalleryWidget   from './widgets/GalleryWidget'
import MusicWidget     from './widgets/MusicWidget'
import CommentsWidget  from './widgets/CommentsWidget'

// Apple widget sizes on a 12-col grid with rowHeight=92 (≈ square per col unit)
// Small      3×3  — 1:1 square
// Medium     6×3  — 2:1 wide
// Large      6×6  — 1:1 big square
// Extra Large 9×6 — 3:2 very wide

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'avatar',   x: 0,  y: 0, w: 3, h: 3 }, // Small
    { i: 'bio',      x: 3,  y: 0, w: 6, h: 3 }, // Medium
    { i: 'music',    x: 9,  y: 0, w: 3, h: 3 }, // Small
    { i: 'friends',  x: 0,  y: 3, w: 6, h: 3 }, // Medium
    { i: 'gallery',  x: 6,  y: 3, w: 6, h: 6 }, // Large
    { i: 'youtube',  x: 0,  y: 6, w: 6, h: 6 }, // Large
    { i: 'comments', x: 6,  y: 9, w: 6, h: 6 }, // Large
  ],
}

const KEY = 'sp-layout-v5'
const load = () => { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : DEFAULT_LAYOUTS } catch { return DEFAULT_LAYOUTS } }

export default function App() {
  const [edit, setEdit]       = useState(false)
  const [layouts, setLayouts] = useState(load)

  const onLayoutChange = useCallback((_, all) => {
    setLayouts(all)
    try { localStorage.setItem(KEY, JSON.stringify(all)) } catch {}
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Topbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 18px 0', maxWidth:1240, margin:'0 auto' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <span style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--muted)', fontWeight:600 }}>
            ✦ Tyler Cox-Druin
          </span>
          <span style={{ fontSize:'0.65rem', color:'var(--accent)', fontWeight:600, letterSpacing:'0.02em' }}>
            @tylercoxdruin
          </span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {edit && (
            <button onClick={() => { setLayouts(DEFAULT_LAYOUTS); try { localStorage.removeItem(KEY) } catch {} }} style={btnStyle('#ef4444', 0.08)}>
              Reset
            </button>
          )}
          <button onClick={() => setEdit(e => !e)} style={edit ? btnStyle('#3b82f6', 0.18, '#93c5fd') : btnStyle('#fff', 0.05)}>
            {edit ? '✓ Done' : '⊹ Edit'}
          </button>
        </div>
      </div>

      {edit && (
        <p style={{ textAlign:'center', fontSize:'0.68rem', color:'rgba(255,255,255,0.2)', padding:'8px 0', letterSpacing:'0.04em' }}>
          drag to move · corner to resize
        </p>
      )}

      <div className={edit ? 'edit-active' : ''} style={{ padding:'12px 14px 60px', maxWidth:1240, margin:'0 auto' }}>
        <ResponsiveGridLayout
          layouts={layouts}
          breakpoints={{ lg:1200, md:900, sm:600, xs:400, xxs:0 }}
          cols={{ lg:12, md:12, sm:6, xs:4, xxs:2 }}
          rowHeight={92}
          width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 28 : 1240, 1212)}
          isDraggable={edit}
          isResizable={edit}
          onLayoutChange={onLayoutChange}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          draggableHandle=".handle"
          useCSSTransforms
        >
          <div key="avatar"><Card edit={edit} label="Avatar"><AvatarWidget /></Card></div>
          <div key="bio"><Card edit={edit} label="Bio"><BioWidget /></Card></div>
          <div key="friends"><Card edit={edit} label="Friends"><FriendsWidget /></Card></div>
          <div key="youtube"><Card edit={edit} label="YouTube"><YouTubeWidget /></Card></div>
          <div key="gallery"><Card edit={edit} label="Gallery"><GalleryWidget /></Card></div>
          <div key="music"><Card edit={edit} label="Music"><MusicWidget editMode={edit} /></Card></div>
          <div key="comments"><Card edit={edit} label="Comments"><CommentsWidget /></Card></div>
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}

function Card({ children, edit, label }) {
  return (
    <div className="card" style={{
      width:'100%', height:'100%',
      background:'var(--card)',
      backdropFilter:'blur(14px)',
      WebkitBackdropFilter:'blur(14px)',
      border:'1px solid var(--border)',
      borderRadius:'var(--radius)',
      overflow:'hidden',
      display:'flex', flexDirection:'column',
      transition:'border-color 0.2s, box-shadow 0.15s',
    }}>
      {edit && (
        <div className="handle" style={{
          height:26, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'grab', userSelect:'none',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          background:'rgba(255,255,255,0.02)',
        }}>
          <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            ⠿ {label}
          </span>
        </div>
      )}
      <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>{children}</div>
    </div>
  )
}

function btnStyle(color, alpha, textColor) {
  const rgb = color === '#3b82f6' ? '59,130,246' : color === '#ef4444' ? '239,68,68' : '255,255,255'
  return {
    padding:'6px 14px', borderRadius:8,
    border:`1px solid rgba(${rgb},${alpha * 2})`,
    background:`rgba(${rgb},${alpha})`,
    color: textColor || 'var(--muted)',
    fontSize:'0.72rem', fontWeight:600,
    fontFamily:'var(--font)', cursor:'pointer',
    letterSpacing:'0.02em', transition:'all 0.2s',
  }
}

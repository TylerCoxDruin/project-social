export default function AvatarWidget() {
  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg,#0d1b2a,#1a2f4a)',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{
        position:'absolute', inset:0,
        background:'radial-gradient(circle at 50% 60%, rgba(59,130,246,0.1) 0%, transparent 65%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        width:'62%', aspectRatio:'1',
        borderRadius:16,
        background:'linear-gradient(145deg,#1e3a5f,#2d4f80)',
        border:'1px solid rgba(255,255,255,0.1)',
        boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'3rem',
      }}>👤</div>
    </div>
  )
}

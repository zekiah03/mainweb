export function FogBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Purple — top-left */}
      <div style={{
        position: 'absolute',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(76,29,149,0.26) 0%, rgba(76,29,149,0.08) 45%, transparent 70%)',
        filter: 'blur(60px)',
        top: -200,
        left: -100,
        animation: 'fogDrift1 28s ease-in-out infinite',
      }} />

      {/* Deep blue — right */}
      <div style={{
        position: 'absolute',
        width: 900,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(15,50,105,0.3) 0%, rgba(15,50,105,0.08) 45%, transparent 70%)',
        filter: 'blur(80px)',
        top: '18%',
        right: -300,
        animation: 'fogDrift2 34s ease-in-out infinite',
      }} />

      {/* Teal — bottom-center */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(6,60,55,0.22) 0%, rgba(6,60,55,0.06) 45%, transparent 70%)',
        filter: 'blur(70px)',
        bottom: -150,
        left: '28%',
        animation: 'fogDrift3 22s ease-in-out infinite',
      }} />

      {/* Deep rose — center */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(100,20,80,0.18) 0%, transparent 70%)',
        filter: 'blur(90px)',
        top: '38%',
        left: '30%',
        animation: 'fogDrift4 40s ease-in-out infinite',
      }} />
    </div>
  )
}

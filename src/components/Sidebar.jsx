import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV } from '../lib/constants'

export default function Sidebar() {
  const [showMore, setShowMore] = useState(false)
  const location = useLocation()
  const secondaryNav = NAV.filter(n => !['brief','pipeline','projects','workouts','habits'].includes(n.id))

  function isActive(nav) {
    if (nav.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(nav.path)
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: 'var(--sidebar-w)', minHeight: '100vh',
        background: 'var(--navy-900)',
        borderRight: '1px solid rgba(201,160,48,.1)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }} className="desktop-sidebar">
        <div style={{ padding: '26px 22px 20px', borderBottom: '1px solid rgba(201,160,48,.08)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:3, color:'var(--gold-400)', marginBottom:4 }}>⚓ SKIPPER MEDIA</div>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:18, fontWeight:900, color:'var(--cream)', lineHeight:1.2 }}>Captain's Log</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, color:'var(--muted)', marginTop:5 }}>PERSONAL OPERATING SYSTEM</div>
        </div>
        <nav style={{ padding:'16px 12px', flex:1, overflowY:'auto' }}>
          {NAV.map(nav => {
            const active = isActive(nav)
            return (
              <Link key={nav.id} to={nav.path} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 11px', borderRadius:'var(--rs)',
                cursor:'pointer', border:'none', width:'100%',
                textAlign:'left', fontSize:12, fontWeight:500, marginBottom:2,
                background: active ? 'rgba(201,160,48,.08)' : 'none',
                color: active ? 'var(--gold-400)' : 'var(--muted)',
                position:'relative', transition:'all var(--t)',
                textDecoration:'none',
              }}>
                {active && <span style={{ position:'absolute', left:0, top:'15%', bottom:'15%', width:2, borderRadius:2, background:'var(--gold-400)' }}/>}
                <span style={{ fontSize:14, width:18, textAlign:'center' }}>{nav.icon}</span>
                {nav.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding:'16px 22px', borderTop:'1px solid rgba(201,160,48,.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--success)', animation:'pulse 2.5s ease-in-out infinite' }}/>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--success)', letterSpacing:1 }}>SYSTEM ACTIVE</span>
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', lineHeight:1.6 }}>
            {new Date().toLocaleDateString('en-US',{weekday:'long'})}<br/>
            {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav style={{
        display:'none', position:'fixed', bottom:0, left:0, right:0,
        height:'var(--bottom-nav-h)',
        background:'rgba(9,21,37,.98)',
        borderTop:'1px solid rgba(201,160,48,.15)',
        backdropFilter:'blur(20px)', zIndex:100,
        alignItems:'center', justifyContent:'space-around',
        padding:'0 4px',
      }} className="mobile-nav">
        {NAV.filter(n => ['brief','pipeline','projects','workouts','habits'].includes(n.id)).map(nav => {
          const active = isActive(nav)
          return (
            <Link key={nav.id} to={nav.path} onClick={() => setShowMore(false)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              padding:'6px 4px', border:'none', background:'none',
              color: active ? 'var(--gold-400)' : 'rgba(255,255,255,.45)',
              cursor:'pointer', flex:1, transition:'color var(--t)', minWidth:0,
              textDecoration:'none',
            }}>
              {active && <span style={{ position:'absolute', top:0, width:28, height:2, borderRadius:2, background:'var(--gold-400)', marginTop:-1 }}/>}
              <span style={{ fontSize:24 }}>{nav.icon}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, whiteSpace:'nowrap' }}>{nav.label.split(' ')[0]}</span>
            </Link>
          )
        })}
        <button onClick={() => setShowMore(s => !s)} style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          padding:'6px 4px', border:'none', background:'none',
          color: showMore ? 'var(--gold-400)' : 'rgba(255,255,255,.45)',
          cursor:'pointer', flex:1, transition:'color var(--t)',
        }}>
          <span style={{ fontSize:24 }}>☰</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>More</span>
        </button>
      </nav>

      {/* ── Mobile More Drawer ── */}
      {showMore && (
        <>
          <div onClick={() => setShowMore(false)} style={{
            display:'none', position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,.6)',
          }} className="mobile-overlay"/>
          <div style={{
            display:'none', position:'fixed',
            bottom:'var(--bottom-nav-h)', left:0, right:0,
            background:'var(--navy-900)',
            borderTop:'1px solid rgba(201,160,48,.15)',
            zIndex:99, padding:'12px 14px 16px',
            flexDirection:'column', gap:6,
          }} className="mobile-drawer">
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'4px 8px 8px' }}>More Pages</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {secondaryNav.map(nav => {
                const active = isActive(nav)
                return (
                  <Link key={nav.id} to={nav.path} onClick={() => setShowMore(false)} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'14px 14px', border:`1px solid ${active ? 'rgba(201,160,48,.3)' : 'rgba(255,255,255,.07)'}`,
                    borderRadius:'var(--rs)',
                    background: active ? 'rgba(201,160,48,.08)' : 'rgba(255,255,255,.02)',
                    color: active ? 'var(--gold-400)' : 'var(--cream)',
                    cursor:'pointer', fontSize:14, fontWeight:500,
                    textDecoration:'none',
                  }}>
                    <span style={{ fontSize:20 }}>{nav.icon}</span>
                    {nav.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; position: relative; }
          .mobile-drawer { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </>
  )
}

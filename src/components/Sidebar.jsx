import React, { useState } from 'react'
import { NAV } from '../lib/constants'

const PRIMARY_NAV = ['brief', 'pipeline', 'projects', 'workouts', 'more']

export default function Sidebar({ page, setPage }) {
  const [showMore, setShowMore] = useState(false)

  const secondaryNav = NAV.filter(n => !['brief','pipeline','projects','workouts'].includes(n.id))

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
        {/* Logo */}
        <div style={{ padding: '26px 22px 20px', borderBottom: '1px solid rgba(201,160,48,.08)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 3, color: 'var(--gold-400)', marginBottom: 4 }}>
            ⚓ SKIPPER MEDIA
          </div>
          <div style={{ fontFamily: 'var(--font-disp)', fontSize: 18, fontWeight: 900, color: 'var(--cream)', lineHeight: 1.2 }}>
            Captain's Log
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 1.5, color: 'var(--muted)', marginTop: 5 }}>
            PERSONAL OPERATING SYSTEM
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {NAV.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setPage(id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 11px', borderRadius: 'var(--rs)',
              cursor: 'pointer', border: 'none', width: '100%',
              textAlign: 'left', fontSize: 12, fontWeight: 500,
              marginBottom: 2,
              background: page === id ? 'rgba(201,160,48,.08)' : 'none',
              color: page === id ? 'var(--gold-400)' : 'var(--muted)',
              position: 'relative', transition: 'all var(--t)',
            }}>
              {page === id && (
                <span style={{ position:'absolute', left:0, top:'15%', bottom:'15%', width:2, borderRadius:2, background:'var(--gold-400)' }} />
              )}
              <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(201,160,48,.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 6 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--success)', animation:'pulse 2.5s ease-in-out infinite' }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--success)', letterSpacing:1 }}>SYSTEM ACTIVE</span>
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', lineHeight: 1.6 }}>
            {new Date().toLocaleDateString('en-US',{weekday:'long'})}<br/>
            {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'var(--bottom-nav-h)',
        background: 'rgba(9,21,37,.97)',
        borderTop: '1px solid rgba(201,160,48,.12)',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        padding: '0 4px',
        alignItems: 'center',
        justifyContent: 'space-around',
      }} className="mobile-nav">
        {/* Primary nav items */}
        {NAV.filter(n => ['brief','pipeline','projects','workouts'].includes(n.id)).map(({ id, icon, label }) => (
          <button key={id} onClick={() => { setPage(id); setShowMore(false) }} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 8px', border: 'none', background: 'none',
            color: page === id ? 'var(--gold-400)' : 'var(--muted)',
            cursor: 'pointer', borderRadius: 'var(--rs)',
            flex: 1, transition: 'color var(--t)',
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize: 7, letterSpacing: .5 }}>{label.split(' ')[0]}</span>
          </button>
        ))}
        {/* More button */}
        <button onClick={() => setShowMore(s => !s)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          padding: '6px 8px', border: 'none',
          background: showMore ? 'rgba(201,160,48,.1)' : 'none',
          color: showMore ? 'var(--gold-400)' : 'var(--muted)',
          cursor: 'pointer', borderRadius: 'var(--rs)',
          flex: 1, transition: 'color var(--t)',
        }}>
          <span style={{ fontSize: 20 }}>⋯</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize: 7, letterSpacing: .5 }}>More</span>
        </button>
      </nav>

      {/* ── Mobile More Drawer ── */}
      {showMore && (
        <div style={{
          display: 'none', position: 'fixed', bottom: 'var(--bottom-nav-h)', left: 0, right: 0,
          background: 'rgba(9,21,37,.98)', borderTop: '1px solid rgba(201,160,48,.12)',
          backdropFilter: 'blur(20px)', zIndex: 99, padding: '12px 16px',
          flexDirection: 'column', gap: 4,
        }} className="mobile-drawer">
          {secondaryNav.map(({ id, icon, label }) => (
            <button key={id} onClick={() => { setPage(id); setShowMore(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', border: 'none', borderRadius: 'var(--rs)',
              background: page === id ? 'rgba(201,160,48,.08)' : 'transparent',
              color: page === id ? 'var(--gold-400)' : 'var(--cream)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              textAlign: 'left', width: '100%',
            }}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
          .mobile-drawer { display: flex !important; }
        }
      `}</style>
    </>
  )
}

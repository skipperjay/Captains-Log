import React from 'react'

export default function HabitsPanel({ habits = [] }) {
  const total = habits.length
  const done = habits.filter(h => h.logged_today).length
  const pct = total > 0 ? Math.round((done/total)*100) : 0

  if (total === 0) return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'18px', textAlign:'center', color:'var(--muted)' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Today's Habits</div>
      <div style={{ fontSize:11 }}>Log habits via WhatsApp to see them here</div>
    </div>
  )

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden' }}>
      <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Today's Habits</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: pct===100 ? 'var(--success)' : 'var(--muted)' }}>
          {done}/{total}
        </div>
      </div>
      <div style={{ padding:'8px 18px 12px' }}>
        {habits.map((h, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom: i < habits.length-1 ? '1px solid rgba(255,255,255,.03)' : 'none' }}>
            <div style={{
              width:8, height:8, borderRadius:'50%', flexShrink:0,
              background: h.logged_today ? 'var(--success)' : 'rgba(255,255,255,.1)',
              boxShadow: h.logged_today ? '0 0 6px rgba(46,200,128,.5)' : 'none',
            }} />
            <span style={{ fontSize:12, color: h.logged_today ? 'var(--cream)' : 'var(--muted)', flex:1 }}>
              {h.habit_name}
            </span>
            {h.streak > 0 && (
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--gold-400)' }}>
                {h.streak}d {h.streak >= 3 ? '🔥' : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

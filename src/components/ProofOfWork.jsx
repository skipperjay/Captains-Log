import React from 'react'

export default function ProofOfWork({ habits, todos, projects, workouts }) {
  const today = new Date().toISOString().split('T')[0]

  const items = []

  // Habits logged today
  const loggedHabits = (habits || []).filter(h => h.logged_today)
  loggedHabits.forEach(h => items.push({
    icon: '✓', color: 'var(--success)',
    text: `${h.habit_name} logged`,
    type: 'habit',
  }))

  // Todos completed today
  const completedTodos = (todos || []).filter(t => {
    if (!t.completed_at) return false
    return t.completed_at.split('T')[0] === today
  })
  completedTodos.forEach(t => items.push({
    icon: '✓', color: 'var(--success)',
    text: `"${t.task}" completed`,
    type: 'todo',
  }))

  // Workout sets today
  const todaySessions = (workouts || []).filter(w =>
    w.session_date && w.session_date.split('T')[0] === today
  )
  todaySessions.forEach(s => items.push({
    icon: '💪', color: 'var(--gold-400)',
    text: `${s.total_sets} workout sets — ${(s.exercises||[]).filter(Boolean).slice(0,2).join(', ')}`,
    type: 'workout',
  }))

  // Project updates today
  const allUpdates = (projects || []).flatMap(p =>
    (p.updates || []).filter(u => u && u.created_at && u.created_at.split('T')[0] === today)
      .map(u => ({ ...u, project_name: p.name }))
  )
  allUpdates.forEach(u => items.push({
    icon: '🚀', color: '#63b3ed',
    text: `${u.project_name}: ${u.body.slice(0, 60)}${u.body.length > 60 ? '...' : ''}`,
    type: 'project',
  }))

  if (items.length === 0) return (
    <div style={{
      background: 'var(--navy-900)', border: '1px solid rgba(255,255,255,.05)',
      borderRadius: 'var(--r)', padding: '16px 18px',
      animation: 'riseIn .5s .4s ease both',
    }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:10 }}>Today's Proof of Work</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', opacity:.6 }}>
        Nothing logged yet today — the day is yours.
      </div>
    </div>
  )

  return (
    <div style={{
      background: 'var(--navy-900)', border: '1px solid rgba(255,255,255,.05)',
      borderRadius: 'var(--r)', padding: '16px 18px',
      animation: 'riseIn .5s .4s ease both',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Today's Proof of Work</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--gold-400)' }}>{items.length} actions</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: item.color,
              boxShadow: `0 0 6px ${item.color}66`,
            }}/>
            <div style={{ fontSize:11, color:'rgba(240,234,216,.75)', lineHeight:1.4 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React from 'react'

function calcMomentum({ habitPct, contentExecPct, projectActivity, workoutSessions }) {
  let score = 0
  let max = 0

  // Habits — 40% weight
  if (habitPct !== null) { score += habitPct * 0.4; max += 40 }

  // Content execution — 30% weight
  if (contentExecPct !== null) { score += contentExecPct * 0.3; max += 30 }

  // Project activity this week — 20% weight (any update = full points)
  if (projectActivity !== null) { score += (projectActivity > 0 ? 100 : 0) * 0.2; max += 20 }

  // Workouts this week — 10% weight
  if (workoutSessions !== null) { score += Math.min(100, (workoutSessions / 3) * 100) * 0.1; max += 10 }

  if (max === 0) return { label: 'No Data', color: 'var(--muted)', pct: 0, direction: 'steady' }

  const pct = Math.round((score / max) * 100)

  if (pct >= 70) return { label: 'Forward', color: 'var(--success)', pct, direction: 'forward', arrow: '↑' }
  if (pct >= 40) return { label: 'Steady', color: 'var(--gold-400)', pct, direction: 'steady', arrow: '→' }
  return { label: 'Slipping', color: 'var(--danger)', pct, direction: 'slipping', arrow: '↓' }
}

export default function MomentumScore({ habitPct, contentExecPct, projects, workouts }) {
  const projectActivity = (projects || []).filter(p => {
    const updates = p.updates || []
    const thisWeek = new Date(Date.now() - 7 * 86400000)
    return updates.some(u => u && new Date(u.created_at) > thisWeek)
  }).length

  const workoutSessions = (workouts || []).filter(w => {
    const d = new Date(w.session_date)
    return d > new Date(Date.now() - 7 * 86400000)
  }).length

  const momentum = calcMomentum({ habitPct, contentExecPct, projectActivity, workoutSessions })

  return (
    <div style={{
      background: 'var(--navy-900)',
      border: `1px solid ${momentum.color}22`,
      borderRadius: 'var(--r)',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: 'riseIn .4s .1s ease both',
    }}>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>Weekly Momentum</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:'var(--font-disp)', fontSize:20, fontWeight:700, color:momentum.color }}>{momentum.arrow}</span>
          <span style={{ fontFamily:'var(--font-disp)', fontSize:16, fontWeight:700, color:momentum.color }}>{momentum.label}</span>
        </div>
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:22, fontWeight:700, color:momentum.color }}>{momentum.pct}%</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginTop:2 }}>
          {projectActivity} project{projectActivity !== 1 ? 's' : ''} active · {workoutSessions} workout{workoutSessions !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}

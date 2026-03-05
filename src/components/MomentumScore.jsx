import React from 'react'

function calcMomentum({ habitPct, contentExecPct, projectActivity, workoutSessions, phasesThisWeek }) {
  let score = 0
  let max = 0

  // Habits — 25% weight
  if (habitPct !== null) { score += habitPct * 0.25; max += 25 }

  // Content execution — 25% weight
  if (contentExecPct !== null) { score += contentExecPct * 0.25; max += 25 }

  // Project activity — 20% weight
  if (projectActivity !== null) { score += (projectActivity > 0 ? 100 : 0) * 0.2; max += 20 }

  // Pipeline phases completed this week — 15% weight
  if (phasesThisWeek !== null) { score += Math.min(100, (phasesThisWeek / 3) * 100) * 0.15; max += 15 }

  // Workouts — 15% weight
  if (workoutSessions !== null) { score += Math.min(100, (workoutSessions / 3) * 100) * 0.15; max += 15 }

  if (max === 0) return { label: 'No Data', color: 'var(--muted)', pct: 0 }

  const pct = Math.round((score / max) * 100)

  if (pct >= 70) return { label: 'Forward',  color: 'var(--success)',  pct, arrow: '↑' }
  if (pct >= 40) return { label: 'Steady',   color: 'var(--gold-400)', pct, arrow: '→' }
  return             { label: 'Slipping',  color: 'var(--danger)',   pct, arrow: '↓' }
}

export default function MomentumScore({ habitPct, contentExecPct, projects, workouts, content }) {
  const projectActivity = (projects || []).filter(p => {
    const updates = p.updates || []
    const thisWeek = new Date(Date.now() - 7 * 86400000)
    return updates.some(u => u && new Date(u.created_at) > thisWeek)
  }).length

  const workoutSessions = (workouts || []).filter(w => {
    return new Date(w.session_date) > new Date(Date.now() - 7 * 86400000)
  }).length

  // Count pipeline phases completed this week
  const thisWeek = new Date(Date.now() - 7 * 86400000)
  const phasesThisWeek = (content || []).flatMap(c => c.phases || [])
    .filter(p => p.completed && p.completed_at && new Date(p.completed_at) > thisWeek)
    .length

  const momentum = calcMomentum({ habitPct, contentExecPct, projectActivity, workoutSessions, phasesThisWeek })

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
          {phasesThisWeek} phase{phasesThisWeek !== 1 ? 's' : ''} done · {workoutSessions} workout{workoutSessions !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}

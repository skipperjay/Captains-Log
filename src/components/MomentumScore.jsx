import React, { useState } from 'react'

function barColor(pct) {
  if (pct >= 70) return 'var(--success)'
  if (pct >= 40) return 'var(--gold-400)'
  return 'var(--danger)'
}

function calcMomentum({ habitPct, contentExecPct, projectActivity, workoutSessions, phasesThisWeek }) {
  let score = 0
  let max = 0

  const factors = []

  // Habits — 25% weight
  const habitScore = habitPct !== null ? habitPct : null
  if (habitScore !== null) { score += habitScore * 0.25; max += 25 }
  factors.push({ name: 'Habits', weight: 25, pct: Math.round(habitScore ?? 0), sub: `${Math.round(habitScore ?? 0)}% today` })

  // Content execution — 25% weight
  const contentScore = contentExecPct !== null ? contentExecPct : null
  if (contentScore !== null) { score += contentScore * 0.25; max += 25 }
  factors.push({ name: 'Content', weight: 25, pct: Math.round(contentScore ?? 0), sub: `${Math.round(contentScore ?? 0)}% execution` })

  // Project activity — 20% weight
  const projectScore = projectActivity !== null ? (projectActivity > 0 ? 100 : 0) : null
  if (projectScore !== null) { score += projectScore * 0.2; max += 20 }
  factors.push({ name: 'Projects', weight: 20, pct: projectScore ?? 0, sub: `${projectActivity ?? 0} active this week` })

  // Pipeline phases completed this week — 15% weight
  const phaseScore = phasesThisWeek !== null ? Math.min(100, (phasesThisWeek / 3) * 100) : null
  if (phaseScore !== null) { score += phaseScore * 0.15; max += 15 }
  factors.push({ name: 'Phases', weight: 15, pct: Math.round(phaseScore ?? 0), sub: `${phasesThisWeek ?? 0}/3 this week` })

  // Workouts — 15% weight
  const workoutScore = workoutSessions !== null ? Math.min(100, (workoutSessions / 3) * 100) : null
  if (workoutScore !== null) { score += workoutScore * 0.15; max += 15 }
  factors.push({ name: 'Workouts', weight: 15, pct: Math.round(workoutScore ?? 0), sub: `${workoutSessions ?? 0}/3 this week` })

  if (max === 0) return { label: 'No Data', color: 'var(--muted)', pct: 0, factors }

  const pct = Math.round((score / max) * 100)

  if (pct >= 70) return { label: 'Forward',  color: 'var(--success)',  pct, arrow: '↑', factors }
  if (pct >= 40) return { label: 'Steady',   color: 'var(--gold-400)', pct, arrow: '→', factors }
  return             { label: 'Slipping',  color: 'var(--danger)',   pct, arrow: '↓', factors }
}

export default function MomentumScore({ habitPct, contentExecPct, projects, workouts, content }) {
  const [expanded, setExpanded] = useState(false)

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
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: 'var(--navy-900)',
        border: `1px solid ${momentum.color}22`,
        borderRadius: 'var(--r)',
        padding: '14px 18px',
        cursor: 'pointer',
        animation: 'riseIn .4s .1s ease both',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Weekly Momentum</div>
            <span style={{ fontSize:8, color:'var(--muted)', transition:'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5 }}>
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

      <div style={{
        maxHeight: expanded ? 200 : 0,
        overflow: 'hidden',
        transition: 'max-height .3s ease',
      }}>
        <div style={{ paddingTop:14, display:'flex', flexDirection:'column', gap:8 }}>
          {momentum.factors.map(f => (
            <div key={f.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', width:58, flexShrink:0 }}>
                {f.name} <span style={{ opacity:.5 }}>{f.weight}%</span>
              </div>
              <div style={{ flex:1, height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                <div style={{
                  width: `${f.pct}%`,
                  height: '100%',
                  background: barColor(f.pct),
                  borderRadius: 2,
                  transition: 'width .4s ease',
                }}/>
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: barColor(f.pct), width:28, textAlign:'right', flexShrink:0 }}>
                {f.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

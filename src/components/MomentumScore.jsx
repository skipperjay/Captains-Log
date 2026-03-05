import React, { useState } from 'react'

function barColor(pct) {
  if (pct >= 70) return 'var(--success)'
  if (pct >= 40) return 'var(--gold-400)'
  return 'var(--danger)'
}

function calcMomentum({ habitPct, contentActivePct, contentActiveTouched, contentActiveTotal, milestonePct, milestonesDone, milestonesTotal, projectUpdatePct, projectsUpdated, projectsActiveCount, workoutSessions, phasesThisWeek }) {
  let score = 0
  let max = 0

  const factors = []

  // Habits — 25% weight
  const habitScore = habitPct !== null ? habitPct : null
  if (habitScore !== null) { score += habitScore * 0.25; max += 25 }
  factors.push({ name: 'Habits', weight: 25, pct: Math.round(habitScore ?? 0), sub: `${Math.round(habitScore ?? 0)}% today` })

  // Content pipeline activity this week — 25% weight
  const contentScore = contentActivePct !== null ? contentActivePct : null
  if (contentScore !== null) { score += contentScore * 0.25; max += 25 }
  factors.push({ name: 'Content', weight: 25, pct: Math.round(contentScore ?? 0), sub: `${contentActiveTouched ?? 0}/${contentActiveTotal ?? 0} items active` })

  // Projects — 20% weight (50% milestones + 50% weekly activity)
  const mPct = milestonePct ?? 0
  const uPct = projectUpdatePct ?? 0
  const projectScore = (milestonePct !== null || projectUpdatePct !== null) ? (mPct * 0.5 + uPct * 0.5) : null
  if (projectScore !== null) { score += projectScore * 0.2; max += 20 }
  factors.push({ name: 'Projects', weight: 20, pct: Math.round(projectScore ?? 0), sub: `${milestonesDone ?? 0}/${milestonesTotal ?? 0} milestones · ${projectsUpdated ?? 0}/${projectsActiveCount ?? 0} active` })

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

export default function MomentumScore({ habitPct, projects, workouts, content }) {
  const [expanded, setExpanded] = useState(false)

  const thisWeek = new Date(Date.now() - 7 * 86400000)

  // Content: how many pipeline items had phase activity this week
  const contentItems = content || []
  const contentActiveTotal = contentItems.length
  const contentActiveTouched = contentItems.filter(c =>
    (c.phases || []).some(p => p.completed && p.completed_at && new Date(p.completed_at) > thisWeek)
  ).length
  const contentActivePct = contentActiveTotal > 0 ? Math.min(100, (contentActiveTouched / contentActiveTotal) * 100) : null

  // Projects: 50% milestone completion + 50% weekly update activity
  const activeProjects = (projects || []).filter(p => p.status === 'active')
  const milestonesTotal = activeProjects.reduce((sum, p) => sum + (parseInt(p.total_milestones) || 0), 0)
  const milestonesDone = activeProjects.reduce((sum, p) => sum + (parseInt(p.completed_milestones) || 0), 0)
  const milestonePct = milestonesTotal > 0 ? Math.min(100, (milestonesDone / milestonesTotal) * 100) : null
  const projectsActiveCount = activeProjects.length
  const projectsUpdated = activeProjects.filter(p =>
    (p.updates || []).some(u => u && new Date(u.created_at) > thisWeek)
  ).length
  const projectUpdatePct = projectsActiveCount > 0 ? Math.min(100, (projectsUpdated / projectsActiveCount) * 100) : null

  const workoutSessions = (workouts || []).filter(w => {
    return new Date(w.session_date) > thisWeek
  }).length

  // Count pipeline phases completed this week
  const phasesThisWeek = contentItems.flatMap(c => c.phases || [])
    .filter(p => p.completed && p.completed_at && new Date(p.completed_at) > thisWeek)
    .length

  const momentum = calcMomentum({ habitPct, contentActivePct, contentActiveTouched, contentActiveTotal, milestonePct, milestonesDone, milestonesTotal, projectUpdatePct, projectsUpdated, projectsActiveCount, workoutSessions, phasesThisWeek })

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

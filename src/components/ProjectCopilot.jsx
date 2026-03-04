import React, { useState } from 'react'

async function getProjectInsight(project, updateText) {
  const milestones = (project.milestones || []).filter(m => m && m.id)
  const total = parseInt(project.total_milestones) || 0
  const done  = parseInt(project.completed_milestones) || 0
  const mins  = parseInt(project.total_mins_logged) || 0
  const hrs   = Math.round(mins / 60 * 10) / 10

  const daysLeft = project.target_date
    ? Math.ceil((new Date(project.target_date) - new Date()) / 86400000)
    : null

  const recentUpdates = (project.updates || [])
    .filter(u => u && u.id)
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)
    .map(u => u.body)
    .join(' | ')

  const nextMilestone = milestones.find(m => !m.completed)

  const prompt = `You are a project momentum advisor for a solopreneur. Be direct, brief, and specific. No fluff.

Project: ${project.name}
Status: ${project.status}
Progress: ${done}/${total} milestones complete
Time invested: ${hrs} hours
${daysLeft !== null ? `Days until target: ${daysLeft}` : ''}
${nextMilestone ? `Next milestone: ${nextMilestone.title}` : 'All milestones complete'}
Recent work: ${recentUpdates || 'none'}
Latest update just logged: "${updateText}"

Give ONE insight in 1-2 sentences. Be specific about the numbers. Acknowledge the work done and point toward what's next. Don't use the word "great" or generic praise.`

  const BASE = import.meta.env.VITE_API_URL || '/api'
  const response = await fetch(`${BASE}/ai/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const result = await response.json()
  return result.content?.[0]?.text || null
}

export default function ProjectCopilot({ project, trigger, updateText }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)

  // Auto-trigger when a new update is logged
  React.useEffect(() => {
    if (trigger && updateText) {
      setLoading(true)
      setInsight(null)
      getProjectInsight(project, updateText)
        .then(text => { if (text) setInsight(text) })
        .finally(() => setLoading(false))
    }
  }, [trigger])

  if (!loading && !insight) return null

  return (
    <div style={{
      marginTop: 10,
      padding: '10px 12px',
      background: 'rgba(201,160,48,.06)',
      border: '1px solid rgba(201,160,48,.15)',
      borderRadius: 'var(--rs)',
      animation: 'riseIn .3s ease',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
        <span style={{ fontSize:11 }}>🧭</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--gold-400)' }}>Project Copilot</span>
      </div>
      {loading ? (
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease infinite' }}/>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease .2s infinite' }}/>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease .4s infinite' }}/>
        </div>
      ) : (
        <div style={{ fontSize:12, color:'rgba(240,234,216,.85)', lineHeight:1.6 }}>{insight}</div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity:.3; transform:scale(.8); }
          50% { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  )
}

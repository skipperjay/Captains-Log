import React, { useState, useEffect } from 'react'

const SESSION_CACHE = 'workout_insight_session_'
const WEEKLY_CACHE  = 'workout_insight_weekly_'

function getCached(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.length < 20) return null
    return parsed
  } catch { return null }
}

function setCached(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

function buildSessionPrompt(data) {
  const muscleLines = (data.muscle_groups || []).map(g =>
    `  ${g.name}: ${g.sets} sets / ${g.volume} volume${g.vs_previous ? ` (${g.vs_previous})` : ''}`
  ).join('\n')

  return `You are a fitness coach analyzing a workout session for Jay, who is recomping (losing fat while building muscle).
Session date: ${data.date}
Muscle groups trained:
${muscleLines}
Goal context: On a recomp, maintaining volume while in a deficit is progress. Volume increases are excellent. Small drops are acceptable if trend is flat.
Give a 2-3 sentence session recap. Be specific about the numbers. Call out wins. Flag anything worth watching. End with one tip for recovery or next session.`
}

function buildWeeklyPrompt(data) {
  const volumeLines = (data.muscle_groups || []).map(g =>
    `  ${g.name}: ${g.pct_change > 0 ? '+' : ''}${g.pct_change}%`
  ).join('\n')

  return `You are a fitness coach reviewing a full training week for Jay, who is recomping (losing fat while building muscle).
Week of: ${data.week}
Sessions completed: ${data.sessions_completed}/${data.sessions_target}
Volume by muscle group this week vs last week:
${volumeLines}
Goal context: On a recomp, maintaining or increasing volume week over week is success. Flag any muscle groups that dropped significantly or weren't trained.
Write a 3-4 sentence weekly summary. Reference actual numbers. Acknowledge maintenance as progress where relevant. End with one clear focus for next week.`
}

async function generateInsight(mode, data) {
  const prompt = mode === 'session' ? buildSessionPrompt(data) : buildWeeklyPrompt(data)
  const BASE = import.meta.env.VITE_API_URL || '/api'
  const response = await fetch(`${BASE}/ai/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `API ${response.status}`)
  }
  const result = await response.json()
  return result.content?.[0]?.text || null
}

export default function WorkoutInsight({ mode, data }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cacheKey = mode === 'session'
    ? SESSION_CACHE + data?.id
    : WEEKLY_CACHE + data?.week

  async function generate(force = false) {
    if (!data) return
    if (!force) {
      const cached = getCached(cacheKey)
      if (cached) { setInsight(cached); return }
    }
    setLoading(true)
    setError(null)
    try {
      const text = await generateInsight(mode, data)
      if (text) { setInsight(text); setCached(cacheKey, text) }
      else { setError('Insight returned empty — try regenerating') }
    } catch (e) {
      console.error('Workout insight error:', e)
      setError('Could not generate insight')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (data) generate()
  }, [data?.id, data?.week])

  const title = mode === 'session' ? 'SESSION INTEL' : 'WEEKLY INTEL'

  return (
    <div style={{
      background: 'var(--navy-900)',
      border: '1px solid rgba(201,160,48,.12)',
      borderRadius: 'var(--r)',
      padding: '18px 22px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'riseIn .4s ease both',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }}/>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', letterSpacing:1.5, marginBottom:10 }}>
            {title}
          </div>

          {loading ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease infinite' }}/>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease .2s infinite' }}/>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease .4s infinite' }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', marginLeft:4 }}>Analyzing workout data...</span>
            </div>
          ) : error ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>{error}</div>
          ) : insight ? (
            <div style={{ fontSize:13, color:'rgba(240,234,216,.85)', lineHeight:1.7, maxWidth:680 }}>
              {insight}
            </div>
          ) : (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>
              Waiting for data...
            </div>
          )}
        </div>

        <button
          onClick={() => generate(true)}
          disabled={loading}
          title="Regenerate insight"
          style={{
            flexShrink: 0,
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 'var(--rs)',
            color: 'var(--muted)',
            fontSize: 13,
            padding: '6px 8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? .4 : 1,
            transition: 'all var(--t)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,160,48,.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'}
        >↺</button>
      </div>
    </div>
  )
}

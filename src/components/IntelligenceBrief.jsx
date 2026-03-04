import React, { useState, useEffect } from 'react'

const CACHE_KEY = 'captain_brief_'
const today = () => new Date().toISOString().split('T')[0]

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY + today())
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setCached(data) {
  try {
    localStorage.setItem(CACHE_KEY + today(), JSON.stringify(data))
  } catch {}
}

async function generateBrief(data) {
  const {
    habitsDone, habitsTotal, streak,
    contentExecPct, totalPublished,
    projects = [], daysSince,
    recentReview,
  } = data

  const activeProjects = projects.filter(p => p.status === 'active')
  const projectSummary = activeProjects.slice(0, 3).map(p => {
    const total = parseInt(p.total_milestones) || 0
    const done  = parseInt(p.completed_milestones) || 0
    const mins  = parseInt(p.total_mins_logged) || 0
    const hrs   = Math.round(mins / 60)
    return `${p.name} (${done}/${total} milestones, ${hrs}h logged)`
  }).join('; ')

  const prompt = `You are the personal intelligence system for a solopreneur named Jay. Generate a morning brief — exactly 2-3 sentences, tight and specific. No fluff, no generic motivation. Use only the data provided. Speak directly to Jay. Focus on momentum, patterns, and what matters today.

Data:
- Habits today: ${habitsDone}/${habitsTotal} logged${streak > 1 ? `, ${streak}-day streak` : ''}
- Content execution: ${Math.round(contentExecPct)}% (${totalPublished} published)
- Days since last publish: ${daysSince !== null ? daysSince : 'unknown'}
- Active projects: ${projectSummary || 'none'}
- Yesterday's top focus: ${recentReview?.top_focus || 'not logged'}
- Yesterday's biggest win: ${recentReview?.biggest_win || 'not logged'}

Write 2-3 sentences. Be specific, direct, and grounding. Reference actual numbers. End with one clear direction for today.`

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

export default function IntelligenceBrief({ dashboardData, habits, projects, reviews }) {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const habitList = habits || []
  const habitsDone = habitList.filter(h => h.logged_today).length
  const habitsTotal = habitList.length
  const streak = habitList.reduce((max, h) => Math.max(max, h.streak || 0), 0)

  const publishedContent = (dashboardData?.recent_content || []).filter(c => c.status === 'published')
  const totalPublished = publishedContent.length
  const contentExecPct = dashboardData?.execution_rate || 0

  const lastPub = [...publishedContent].sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0]
  const daysSince = lastPub ? Math.floor((Date.now() - new Date(lastPub.published_at)) / 86400000) : null

  const recentReview = reviews?.length > 0
    ? [...reviews].sort((a, b) => new Date(b.review_date) - new Date(a.review_date))[0]
    : null

  async function generate(force = false) {
    if (!force) {
      const cached = getCached()
      if (cached) { setBrief(cached); return }
    }
    setLoading(true)
    setError(null)
    try {
      const text = await generateBrief({
        habitsDone, habitsTotal, streak,
        contentExecPct, totalPublished,
        projects: projects || [],
        daysSince, recentReview,
      })
      if (text) { setBrief(text); setCached(text) }
    } catch (e) {
      setError('Could not generate brief')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (habitsTotal >= 0 && !brief) generate()
  }, [habitsTotal])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

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
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:17, fontWeight:700, color:'var(--cream)' }}>
              {greeting()}, Captain.
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', letterSpacing:1 }}>
              {todayStr.toUpperCase()}
            </div>
          </div>

          {loading ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease infinite' }}/>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease .2s infinite' }}/>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold-400)', animation:'pulse 1.2s ease .4s infinite' }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', marginLeft:4 }}>Generating your brief...</span>
            </div>
          ) : error ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>{error}</div>
          ) : brief ? (
            <div style={{ fontSize:13, color:'rgba(240,234,216,.85)', lineHeight:1.7, maxWidth:680 }}>
              {brief}
            </div>
          ) : (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>
              Loading your data...
            </div>
          )}
        </div>

        <button
          onClick={() => generate(true)}
          disabled={loading}
          title="Regenerate brief"
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

import React from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getMessage({ habitsDone, habitsTotal, streak, daysSince, contentExecPct }) {
  const remaining = habitsTotal - habitsDone
  const allDone = remaining === 0 && habitsTotal > 0

  if (allDone && streak >= 7) return { text:`All habits done · ${streak} day streak 🔥 — you're on a run.`, color:'var(--success)' }
  if (allDone) return { text:`All ${habitsTotal} habits logged — strong day.`, color:'var(--success)' }
  if (remaining === 1) return { text:`One habit left — finish strong today.`, color:'var(--gold-400)' }
  if (remaining > 1 && habitsTotal > 0) return { text:`${remaining} habits still to go — the day isn't over.`, color:'var(--gold-400)' }
  if (daysSince !== null && daysSince > 14) return { text:`${daysSince} days since last publish — time to ship.`, color:'var(--warn)' }
  if (contentExecPct >= 80) return { text:`${Math.round(contentExecPct)}% execution rate — the process is working.`, color:'var(--success)' }
  if (streak >= 3) return { text:`${streak} day habit streak 🔥 — keep the chain alive.`, color:'var(--gold-400)' }
  return { text:`Start the day with intention. One habit at a time.`, color:'var(--muted)' }
}

export default function BriefHeader({ habitsDone, habitsTotal, streak, daysSince, contentExecPct }) {
  const greeting = getGreeting()
  const { text, color } = getMessage({ habitsDone, habitsTotal, streak, daysSince, contentExecPct })
  const today = new Date().toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })

  return (
    <div style={{
      background:'var(--navy-900)',
      border:'1px solid rgba(201,160,48,.1)',
      borderRadius:'var(--r)',
      padding:'16px 20px',
      position:'relative', overflow:'hidden',
      animation:'riseIn .4s ease both',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:18, fontWeight:700, color:'var(--cream)' }}>
            {greeting}, Captain.
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:3, letterSpacing:.5 }}>
            {today.toUpperCase()}
          </div>
        </div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:11, color, textAlign:'right',
          maxWidth:280, lineHeight:1.5,
        }}>
          {text}
        </div>
      </div>
    </div>
  )
}

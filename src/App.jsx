import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Gauge from './components/Gauge'
import DailyHabits from './components/DailyHabits'
import QuickCapture from './components/QuickCapture'
import Pipeline from './components/Pipeline'
import Workouts from './components/Workouts'
import DailyReview from './components/DailyReview'
import Projects from './components/Projects'
import Notes from './components/Notes'
import Ideas from './components/Ideas'
import Todos from './components/Todos'
import BriefHeader from './components/BriefHeader'
import QuickLogWorkout from './components/QuickLogWorkout'
import CalendarSidebar from './components/CalendarSidebar'
import IntelligenceBrief from './components/IntelligenceBrief'
import MomentumScore from './components/MomentumScore'
import ProofOfWork from './components/ProofOfWork'
import { GrowthChart, PillarChart, ExecChart } from './components/Charts'
import { api } from './lib/api'
import { PILLARS, fmtDate } from './lib/constants'

// ── Shared UI ─────────────────────────────────────────────
function Toast({ msg, icon }) {
  return (
    <div style={{ position:'fixed', bottom:22, right:22, background:'var(--navy-700)', border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--r)', padding:'12px 18px', fontSize:12, color:'var(--cream)', zIndex:999, display:'flex', alignItems:'center', gap:8, maxWidth:300, boxShadow:'0 8px 32px rgba(0,0,0,.4)', animation:'riseIn .3s cubic-bezier(.34,1.56,.64,1)' }}>
      <span style={{ color:'var(--gold-400)' }}>{icon}</span> {msg}
    </div>
  )
}

function Panel({ title, meta, children, delay=0 }) {
  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:`riseIn .5s ${delay}s ease both` }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>{title}</div>
        {meta && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', letterSpacing:1 }}>{meta}</div>}
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  )
}

function MetricRow({ label, value, note, noteColor, border=true }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom: border ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:3 }}>{label}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color: noteColor||'var(--muted)' }}>{note}</div>
      </div>
      <div style={{ fontFamily:'var(--font-disp)', fontSize:26, fontWeight:700, color:'var(--gold-400)' }}>{value}</div>
    </div>
  )
}

// ── Performance ───────────────────────────────────────────
function Performance({ content=[], dash, reviews=[], growth=[] }) {
  const [filter, setFilter] = useState('all')
  const published = content.filter(c => c.status==='published')
  const filtered = filter==='all' ? published : published.filter(c=>c.pillar===filter)
  const pillars = [{ id:'all', label:'All' }, ...Object.entries(PILLARS).map(([id,{label}])=>({id,label}))]
  const ytSubs = dash?.youtube?.subscribers || 0
  const igFollow = dash?.instagram?.followers || 0

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {pillars.map(p=>(
          <button key={p.id} onClick={()=>setFilter(p.id)} style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', padding:'5px 12px', borderRadius:20, border:`1px solid ${filter===p.id?'rgba(201,160,48,.25)':'rgba(255,255,255,.08)'}`, background: filter===p.id?'rgba(201,160,48,.1)':'none', color: filter===p.id?'var(--gold-400)':'var(--muted)', cursor:'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Published Content</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{filtered.length} pieces</div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
            <thead>
              <tr>{['#','Title','Pillar','Views','CTR'].map(h=>(
                <th key={h} style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', textAlign:'left', padding:'9px 14px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={5}><div style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontSize:12 }}>Publish content to see performance data.</div></td></tr>
              ) : filtered.map((c,i) => {
                const p = PILLARS[c.pillar]||{label:c.pillar,color:'var(--muted)'}
                return (
                  <tr key={c.id} style={{ borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>{i+1}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, fontWeight:500, color:'var(--cream)', maxWidth:220 }}>{c.title}</td>
                    <td style={{ padding:'10px 14px' }}><span style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 7px', borderRadius:8, background:p.color+'1a', color:p.color }}>{p.label}</span></td>
                    <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--gold-400)', fontWeight:500 }}>{c.metrics?.views?.toLocaleString()||'—'}</td>
                    <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--gold-400)', fontWeight:500 }}>{c.metrics?.ctr?`${c.metrics.ctr}%`:'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Panel title="Audience Growth" meta="Last 12 weeks">
        <GrowthChart data={growth}/>
      </Panel>
      <Panel title="Audience" meta="Current totals">
        <MetricRow label="YouTube Subscribers" value={ytSubs.toLocaleString()} note={ytSubs>0?'— Live from YouTube API':'— Connect YouTube API'}/>
        <MetricRow label="Instagram Followers" value={igFollow.toLocaleString()} note={igFollow>0?'— Live':'— Not connected'}/>
        <MetricRow label="Newsletter" value={(reviews?.[0]?.nl_subs||0).toLocaleString()} note="— Log in weekly review" border={false}/>
      </Panel>
    </div>
  )
}

// ── Process Health ────────────────────────────────────────
function ProcessHealth({ execPct, published, dailyReviews=[] }) {
  // Build execution chart from daily reviews grouped by week
  const weekMap = {}
  dailyReviews.forEach(r => {
    const d = new Date(r.review_date)
    const mon = new Date(d)
    mon.setDate(d.getDate() - d.getDay() + 1)
    const key = mon.toLocaleDateString('en-US',{month:'short',day:'numeric'})
    if (!weekMap[key]) weekMap[key] = { week:key, entries:0 }
    weekMap[key].entries++
  })
  const execHistory = Object.values(weekMap).slice(-8).map(w => ({
    week: w.week,
    planned: 7,
    published: w.entries,
  }))

  const milestones = [
    { n:10,  label:'First dataset',           meaning:'Patterns start to emerge' },
    { n:50,  label:'Meaningful patterns',     meaning:'Data becomes actionable' },
    { n:100, label:'Competitive advantage',   meaning:'Your edge compounds' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'center', animation:'riseIn .5s ease both' }}>
        <Gauge pct={execPct} label="Content Execution Rate — All Time" sub={`${published} pieces published`} size="large"/>
      </div>
      <Panel title="Daily Review Consistency" meta="Entries per week">
        {execHistory.length > 0
          ? <ExecChart data={execHistory}/>
          : <div style={{ textAlign:'center', padding:'28px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Log daily reviews to see consistency chart</div>
        }
      </Panel>
      <Panel title="Content Milestones">
        {milestones.map(m => {
          const done = published >= m.n
          const pct = Math.min(100,(published/m.n)*100)
          return (
            <div key={m.n} style={{ padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <div>
                  <span style={{ fontSize:12, color: done?'var(--success)':'var(--cream)' }}>{done?'✓ ':''}{m.n} rows — {m.label}</span>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:2 }}>{m.meaning}</div>
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>{published}/{m.n}</span>
              </div>
              <div style={{ height:3, borderRadius:3, background:'rgba(255,255,255,.06)', overflow:'hidden', marginTop:6 }}>
                <div style={{ height:'100%', borderRadius:3, width:`${pct}%`, background: done?'var(--success)':'var(--gold-400)', transition:'width 1s ease' }}/>
              </div>
            </div>
          )
        })}
      </Panel>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('brief')
  const [toast, setToast] = useState(null)

  function showToast(msg, icon='✓') {
    setToast({msg,icon})
    setTimeout(()=>setToast(null),3200)
  }

  const { data: dash }         = useQuery({ queryKey:['dashboard'],     queryFn: api.dashboard,      refetchInterval:60_000 })
  const { data: content }      = useQuery({ queryKey:['content'],       queryFn: api.content })
  const { data: reviews }      = useQuery({ queryKey:['reviews'],       queryFn: api.reviews })
  const { data: dailyReviews } = useQuery({ queryKey:['daily-reviews'], queryFn: api.dailyReviews })
  const { data: growth }       = useQuery({ queryKey:['growth'],        queryFn: ()=>api.growth(84) })
  const { data: habits }       = useQuery({ queryKey:['habitsToday'],   queryFn: api.habitsToday,    refetchInterval:30_000 })
  const { data: todos }        = useQuery({ queryKey:['todos'],         queryFn: api.todos,          refetchInterval:30_000 })
  const { data: workouts }     = useQuery({ queryKey:['workouts'],      queryFn: api.workouts,       refetchInterval:60_000 })
  const { data: projects }     = useQuery({ queryKey:['projects'],      queryFn: api.projects,       refetchInterval:60_000 })

  const pipeline   = dash?.pipeline || []
  const ytSubs     = dash?.youtube?.subscribers || 0
  const igFollow   = dash?.instagram?.followers || 0

  const publishedContent  = (content||[]).filter(c=>c.status==='published')
  const published         = publishedContent.length
  const totalPlanned      = (reviews||[]).reduce((a,r)=>a+(r.planned||0),0)
  const totalPublished    = (reviews||[]).reduce((a,r)=>a+(r.published||0),0)
  const contentExecPct    = totalPlanned>0 ? Math.min(100,(totalPublished/totalPlanned)*100) : 0

  const habitList   = habits||[]
  const habitsDone  = habitList.filter(h=>h.logged_today).length
  const habitsTotal = habitList.length
  const habitPct    = habitsTotal>0 ? Math.min(100,(habitsDone/habitsTotal)*100) : 0

  // Streak — consecutive days all habits logged
  let streak = 0
  if (reviews) {
    const sorted = [...(reviews||[])].sort((a,b)=>new Date(b.week_start)-new Date(a.week_start))
    for (const r of sorted) { if ((r.published||0)>=1) streak++; else break }
  }

  const lastPub = [...publishedContent].sort((a,b)=>new Date(b.published_at)-new Date(a.published_at))[0]
  const daysSince = lastPub ? Math.floor((Date.now()-new Date(lastPub.published_at))/86400000) : null

  const growthData = growth || (dash?.youtube ? [{ date:new Date().toISOString().split('T')[0], yt:ytSubs, ig:igFollow }] : [])

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage}/>
      <main className="main-content">
        <Topbar page={page} onToast={showToast}/>
        <div className="page-body">

          {/* ══ DAILY BRIEF ══ */}
          {page==='brief' && (
            <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
              {/* Main column */}
              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:16 }}>
                <IntelligenceBrief
                  dashboardData={dash}
                  habits={habitList}
                  projects={projects||[]}
                  reviews={dailyReviews||[]}
                />
                <MomentumScore
                  habitPct={habitPct}
                  contentExecPct={contentExecPct}
                  projects={projects||[]}
                  workouts={workouts||[]}
                  content={content||[]}
                />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }} className="gauge-grid">
                  <Gauge pct={habitPct} label="Today's Habits" sub={habitsTotal>0?`${habitsDone} of ${habitsTotal} habits logged`:'Log habits via WhatsApp'} size="large"/>
                  <Gauge pct={contentExecPct} label="Content Execution" sub={`${totalPublished} of ${totalPlanned} planned`} size="large"/>
                </div>
                <DailyHabits habits={habitList} onToast={showToast}/>
                <Todos todos={todos||[]} onToast={showToast}/>
                <QuickLogWorkout onToast={showToast}/>
                <QuickCapture onToast={showToast}/>
                <ProofOfWork
                  habits={habitList}
                  todos={todos||[]}
                  projects={projects||[]}
                  workouts={workouts||[]}
                  content={content||[]}
                />
              </div>
              {/* Calendar sidebar */}
              <div className="calendar-col">
                <CalendarSidebar/>
              </div>
              <style>{`
                .calendar-col { display: block; }
                @media (max-width: 900px) { .calendar-col { display: none; } }
                @media (max-width: 600px) { .gauge-grid { grid-template-columns: 1fr !important; } }
              `}</style>
            </div>
          )}

          {/* ══ PIPELINE ══ */}
          {page==='pipeline' && <Pipeline pipeline={pipeline} onToast={showToast}/>}

          {/* ══ PROJECTS ══ */}
          {page==='projects' && <Projects onToast={showToast}/>}

          {/* ══ IDEAS ══ */}
          {page==='ideas' && <Ideas onToast={showToast}/>}

          {/* ══ NOTES ══ */}
          {page==='notes' && <Notes onToast={showToast}/>}

          {/* ══ WORKOUTS ══ */}
          {page==='workouts' && <Workouts/>}

          {/* ══ PERFORMANCE ══ */}
          {page==='performance' && <Performance content={content||[]} dash={dash} reviews={reviews||[]} growth={growthData}/>}

          {/* ══ DAILY REVIEW ══ */}
          {page==='review' && <DailyReview onToast={showToast}/>}

          {/* ══ PROCESS HEALTH ══ */}
          {page==='health' && <ProcessHealth execPct={contentExecPct} published={published} dailyReviews={dailyReviews||[]}/>}

        </div>
      </main>
      {toast && <Toast {...toast}/>}
    </div>
  )
}

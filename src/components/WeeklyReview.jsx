import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { getMonday, fmtDate } from '../lib/constants'

const inp = { background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'var(--rs)', padding:'8px 11px', color:'var(--cream)', fontSize:12, outline:'none', width:'100%', fontFamily:'var(--font-body)' }
function F({ label, children }) {
  return <div><label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>{label}</label>{children}</div>
}
function Panel({ title, meta, children }) {
  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>{title}</div>
        {meta && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{meta}</div>}
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  )
}

export default function WeeklyReview({ reviews=[], onToast }) {
  const qc = useQueryClient()
  const blank = { planned:'', published:'', yt_subs:'', ig_followers:'', nl_subs:'', hours:'', biggest_win:'', biggest_blocker:'', lesson_this_week:'', next_week_priority:'' }
  const [form, setForm] = useState(blank)
  const s = (k,v) => setForm(f=>({...f,[k]:v}))

  const mut = useMutation({
    mutationFn: api.saveReview,
    onSuccess: () => { qc.invalidateQueries(['reviews']); qc.invalidateQueries(['dashboard']); setForm(blank); onToast('Review saved ↑','◻') },
    onError: () => onToast('Failed to save','✖'),
  })

  function save() {
    mut.mutate({ week_start: getMonday().toISOString().split('T')[0], planned:+form.planned||0, published:+form.published||0, yt_subs:+form.yt_subs||0, ig_followers:+form.ig_followers||0, nl_subs:+form.nl_subs||0, hours_on_content:+form.hours||0, biggest_win:form.biggest_win, biggest_blocker:form.biggest_blocker, lesson_this_week:form.lesson_this_week, next_week_priority:form.next_week_priority })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <Panel title="Log This Week" meta={`Week of ${fmtDate(getMonday())}`}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          <F label="Pieces Planned"><input type="number" value={form.planned} onChange={e=>s('planned',e.target.value)} placeholder="0" style={inp}/></F>
          <F label="Pieces Published"><input type="number" value={form.published} onChange={e=>s('published',e.target.value)} placeholder="0" style={inp}/></F>
          <F label="YT Subscribers"><input type="number" value={form.yt_subs} onChange={e=>s('yt_subs',e.target.value)} placeholder="0" style={inp}/></F>
          <F label="IG Followers"><input type="number" value={form.ig_followers} onChange={e=>s('ig_followers',e.target.value)} placeholder="0" style={inp}/></F>
          <F label="Newsletter Subs"><input type="number" value={form.nl_subs} onChange={e=>s('nl_subs',e.target.value)} placeholder="0" style={inp}/></F>
          <F label="Hours on Content"><input type="number" value={form.hours} onChange={e=>s('hours',e.target.value)} placeholder="0" style={inp}/></F>
          <div style={{ gridColumn:'1/-1' }}><F label="Biggest Win"><input value={form.biggest_win} onChange={e=>s('biggest_win',e.target.value)} placeholder="What went right?" style={inp}/></F></div>
          <div style={{ gridColumn:'1/-1' }}><F label="Biggest Blocker"><input value={form.biggest_blocker} onChange={e=>s('biggest_blocker',e.target.value)} placeholder="What slowed you down?" style={inp}/></F></div>
          <div style={{ gridColumn:'1/-1' }}><F label="Lesson Learned"><textarea value={form.lesson_this_week} onChange={e=>s('lesson_this_week',e.target.value)} placeholder="What did the data teach you?" style={{...inp,resize:'vertical',minHeight:70}}/></F></div>
          <div style={{ gridColumn:'1/-1' }}><F label="Next Week Priority"><input value={form.next_week_priority} onChange={e=>s('next_week_priority',e.target.value)} placeholder="Top focus" style={inp}/></F></div>
        </div>
        <button onClick={save} disabled={mut.isPending} style={{ marginTop:16, padding:'9px 22px', background:'var(--gold-400)', color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          {mut.isPending ? 'Saving...' : 'Save Review →'}
        </button>
      </Panel>

      <Panel title="Review History" meta="Last 12 weeks">
        {reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px 0', color:'var(--muted)' }}>
            <div style={{ fontSize:24, opacity:.3, marginBottom:8 }}>◻</div>
            <div style={{ fontSize:11 }}>No reviews yet. Log your first check-in above.</div>
          </div>
        ) : reviews.slice(0,12).map((r,i) => {
          const rate = r.planned > 0 ? Math.round((r.published/r.planned)*100) : 0
          return (
            <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--gold-400)' }}>{fmtDate(r.week_start,{month:'short',day:'numeric',year:'numeric'})}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{r.published||0}/{r.planned||0} · {rate}% exec</span>
              </div>
              {r.biggest_win && <div style={{ fontSize:11, color:'var(--cream)', marginBottom:2 }}>✓ {r.biggest_win}</div>}
              {r.lesson_this_week && <div style={{ fontSize:10, color:'var(--muted)', fontStyle:'italic' }}>"{r.lesson_this_week}"</div>}
            </div>
          )
        })}
      </Panel>
    </div>
  )
}

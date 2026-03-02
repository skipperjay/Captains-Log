import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const inp = {
  background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)',
  borderRadius:'var(--rs)', padding:'10px 12px', color:'var(--cream)',
  fontSize:13, outline:'none', width:'100%', fontFamily:'var(--font-body)',
  resize:'vertical', lineHeight:1.6, transition:'border-color var(--t)',
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:6 }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={inp}
        onFocus={e => e.target.style.borderColor='rgba(201,160,48,.3)'}
        onBlur={e => e.target.style.borderColor='rgba(255,255,255,.07)'}
      />
    </div>
  )
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(review.review_date)
  const label = date.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })

  return (
    <div style={{ padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: expanded ? 12 : 0 }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--gold-400)', marginBottom:3 }}>{label}</div>
          {!expanded && review.top_focus && (
            <div style={{ fontSize:11, color:'var(--muted)', fontStyle:'italic' }}>Focus: {review.top_focus}</div>
          )}
        </div>
        <button onClick={() => setExpanded(s=>!s)} style={{ background:'rgba(255,255,255,.05)', border:'none', color:'var(--muted)', borderRadius:'var(--rs)', padding:'3px 8px', cursor:'pointer', fontSize:11 }}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>
      {expanded && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {review.biggest_win && (
            <div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--success)', marginBottom:3 }}>Biggest Win</div>
              <div style={{ fontSize:12, color:'var(--cream)', lineHeight:1.5 }}>{review.biggest_win}</div>
            </div>
          )}
          {review.biggest_blocker && (
            <div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--danger)', marginBottom:3 }}>Biggest Blocker</div>
              <div style={{ fontSize:12, color:'var(--cream)', lineHeight:1.5 }}>{review.biggest_blocker}</div>
            </div>
          )}
          {review.lesson_learned && (
            <div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--blue)', marginBottom:3 }}>Lesson Learned</div>
              <div style={{ fontSize:12, color:'var(--cream)', lineHeight:1.5, fontStyle:'italic' }}>"{review.lesson_learned}"</div>
            </div>
          )}
          {review.top_focus && (
            <div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--gold-400)', marginBottom:3 }}>Top Focus</div>
              <div style={{ fontSize:12, color:'var(--cream)', lineHeight:1.5 }}>{review.top_focus}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DailyReview({ onToast }) {
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ biggest_win:'', biggest_blocker:'', lesson_learned:'', top_focus:'' })
  const s = (k,v) => setForm(f=>({...f,[k]:v}))

  const { data: reviews=[] } = useQuery({ queryKey:['daily-reviews'], queryFn: api.dailyReviews })

  // Check if today already logged
  const todayReview = reviews.find(r => r.review_date?.split('T')[0] === today)

  const mut = useMutation({
    mutationFn: api.saveDailyReview,
    onSuccess: () => {
      qc.invalidateQueries(['daily-reviews'])
      setForm({ biggest_win:'', biggest_blocker:'', lesson_learned:'', top_focus:'' })
      onToast('Review saved', '◻')
    },
    onError: () => onToast('Failed to save', '✖'),
  })

  function save() {
    if (!form.biggest_win && !form.biggest_blocker && !form.lesson_learned && !form.top_focus) {
      onToast('Add at least one entry', '⚠')
      return
    }
    mut.mutate({ review_date: today, ...form })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Today's Review Form */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(201,160,48,.12)', borderRadius:'var(--r)', overflow:'hidden', position:'relative', animation:'riseIn .4s ease both' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }}/>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:16, fontWeight:700, color:'var(--cream)' }}>Daily Review</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:3 }}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
            </div>
          </div>
          {todayReview && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--success)', background:'rgba(46,200,128,.1)', padding:'4px 10px', borderRadius:20 }}>
              ✓ Logged today
            </div>
          )}
        </div>
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:16 }}>
          <Field
            label="Biggest Win"
            placeholder="What went right today? What are you proud of?"
            value={form.biggest_win}
            onChange={v=>s('biggest_win',v)}
          />
          <Field
            label="Biggest Blocker"
            placeholder="What slowed you down? Was it in your control?"
            value={form.biggest_blocker}
            onChange={v=>s('biggest_blocker',v)}
          />
          <Field
            label="Lesson Learned"
            placeholder="What did today teach you?"
            value={form.lesson_learned}
            onChange={v=>s('lesson_learned',v)}
          />
          <Field
            label="Top Focus Tomorrow"
            placeholder="One thing that matters most tomorrow"
            value={form.top_focus}
            onChange={v=>s('top_focus',v)}
          />
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={save} disabled={mut.isPending} style={{
              padding:'9px 24px', background:'var(--gold-400)', color:'var(--navy-900)',
              border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer',
            }}>
              {mut.isPending ? 'Saving...' : 'Log Today →'}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .1s ease both' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Review History</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{reviews.length} entries</div>
        </div>
        <div style={{ padding:'4px 18px 14px' }}>
          {reviews.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>
              <div style={{ fontSize:22, opacity:.2, marginBottom:8 }}>◻</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>Log your first review above</div>
            </div>
          ) : reviews.map((r,i) => <ReviewCard key={i} review={r}/>)}
        </div>
      </div>

    </div>
  )
}

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PILLARS } from '../lib/constants'

const FORMATS = [
  { value:'long_form_video',  label:'Long Form Video' },
  { value:'short_form_video', label:'Short Form Video' },
  { value:'newsletter',       label:'Newsletter' },
  { value:'carousel',         label:'Carousel' },
  { value:'image_post',       label:'Image Post' },
  { value:'reel',             label:'Reel' },
]

const STAGES = [
  { value:'backlog',     label:'Backlog' },
  { value:'in_progress', label:'In Progress' },
  { value:'review',      label:'Review' },
  { value:'approved',    label:'Approved' },
]

const inp = {
  background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)',
  borderRadius:'var(--rs)', padding:'8px 11px', color:'var(--cream)',
  fontSize:12, outline:'none', width:'100%', fontFamily:'var(--font-body)',
}

export default function AddContent({ onClose, onToast }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title:'', pillar:'build_the_person', format:'long_form_video',
    stage:'backlog', hook:'', description:'', target_publish_date:'',
  })

  const s = (k,v) => setForm(f=>({...f,[k]:v}))

  const mut = useMutation({
    mutationFn: api.addContent,
    onSuccess: () => {
      qc.invalidateQueries(['dashboard'])
      qc.invalidateQueries(['content'])
      onToast('Content added to pipeline', '⬡')
      onClose()
    },
    onError: () => onToast('Failed to add content', '✖'),
  })

  function save() {
    if (!form.title.trim()) { onToast('Title is required', '⚠'); return }
    mut.mutate({ ...form, status: form.stage === 'backlog' ? 'idea' : 'scripted' })
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
      backdropFilter:'blur(8px)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20, animation:'fadeIn .2s ease',
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:'var(--navy-900)', border:'1px solid rgba(201,160,48,.15)',
        borderRadius:'var(--r)', width:'100%', maxWidth:520,
        animation:'riseIn .3s ease',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }} />

        <div style={{ padding:'20px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:16, fontWeight:700, color:'var(--cream)' }}>Add to Pipeline</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          {/* Title */}
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Title *</label>
            <input value={form.title} onChange={e=>s('title',e.target.value)} placeholder="Content title..." style={inp} autoFocus />
          </div>

          {/* Pillar + Format */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Pillar</label>
              <select value={form.pillar} onChange={e=>s('pillar',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                {Object.entries(PILLARS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Format</label>
              <select value={form.format} onChange={e=>s('format',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                {FORMATS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Stage + Target Date */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Pipeline Stage</label>
              <select value={form.stage} onChange={e=>s('stage',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                {STAGES.map(st=><option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Target Date</label>
              <input type="date" value={form.target_publish_date} onChange={e=>s('target_publish_date',e.target.value)} style={inp} />
            </div>
          </div>

          {/* Hook */}
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Hook <span style={{ opacity:.5 }}>(optional)</span></label>
            <input value={form.hook} onChange={e=>s('hook',e.target.value)} placeholder="Opening line..." style={inp} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Description <span style={{ opacity:.5 }}>(optional)</span></label>
            <textarea value={form.description} onChange={e=>s('description',e.target.value)} placeholder="What does this piece cover?" style={{ ...inp, resize:'vertical', minHeight:60 }} />
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4 }}>
            <button onClick={onClose} style={{ padding:'8px 16px', background:'none', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', fontSize:12, cursor:'pointer' }}>Cancel</button>
            <button onClick={save} disabled={mut.isPending} style={{ padding:'8px 20px', background:'var(--gold-400)', color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {mut.isPending ? 'Adding...' : 'Add to Pipeline →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

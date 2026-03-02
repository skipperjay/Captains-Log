import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

const inp = {
  background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)',
  borderRadius:'var(--rs)', padding:'8px 11px', color:'var(--cream)',
  fontSize:12, outline:'none', fontFamily:'var(--font-body)',
  transition:'border-color var(--t)',
}

function PromoteModal({ idea, onClose, onToast }) {
  const qc = useQueryClient()
  const [pillar, setPillar] = useState(idea.pillar || 'build_the_business')
  const [format, setFormat] = useState('long_form_video')
  const [stage, setStage] = useState('backlog')

  const mut = useMutation({
    mutationFn: () => api.promoteIdea(idea.id, { pillar, format, stage }),
    onSuccess: () => {
      qc.invalidateQueries(['ideas'])
      qc.invalidateQueries(['dashboard'])
      qc.invalidateQueries(['content'])
      onToast('Added to pipeline ⬡', '💡')
      onClose()
    },
    onError: () => onToast('Failed to promote', '✖'),
  })

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
      backdropFilter:'blur(8px)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:'var(--navy-900)', border:'1px solid rgba(201,160,48,.2)',
        borderRadius:'var(--r)', width:'100%', maxWidth:440,
        position:'relative', overflow:'hidden',
        animation:'riseIn .3s ease',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }}/>

        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:15, fontWeight:700, color:'var(--cream)' }}>Add to Pipeline</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          {/* Idea preview */}
          <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'var(--rs)', padding:'10px 12px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>Idea</div>
            <div style={{ fontSize:12, color:'var(--cream)', lineHeight:1.5 }}>{idea.title || idea.notes}</div>
          </div>

          {/* Pillar */}
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Pillar</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {Object.entries(PILLARS).map(([k,v]) => (
                <button key={k} onClick={()=>setPillar(k)} style={{
                  padding:'8px 10px', borderRadius:'var(--rs)', cursor:'pointer', textAlign:'left',
                  background: pillar===k ? v.color+'1a' : 'rgba(255,255,255,.03)',
                  border: `1px solid ${pillar===k ? v.color+'44' : 'rgba(255,255,255,.06)'}`,
                  color: pillar===k ? v.color : 'var(--muted)',
                  fontSize:11, fontWeight: pillar===k ? 600 : 400,
                  transition:'all var(--t)',
                }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Format</label>
            <select value={format} onChange={e=>setFormat(e.target.value)} style={{ ...inp, width:'100%', cursor:'pointer' }}>
              {FORMATS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Start in</label>
            <div style={{ display:'flex', gap:6 }}>
              {[{v:'backlog',label:'Backlog'},{v:'in_progress',label:'In Progress'}].map(s=>(
                <button key={s.v} onClick={()=>setStage(s.v)} style={{
                  flex:1, padding:'7px', borderRadius:'var(--rs)', cursor:'pointer',
                  background: stage===s.v ? 'rgba(201,160,48,.1)' : 'rgba(255,255,255,.03)',
                  border: `1px solid ${stage===s.v ? 'rgba(201,160,48,.3)' : 'rgba(255,255,255,.06)'}`,
                  color: stage===s.v ? 'var(--gold-400)' : 'var(--muted)',
                  fontSize:11, transition:'all var(--t)',
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4 }}>
            <button onClick={onClose} style={{ padding:'8px 16px', background:'none', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', fontSize:12, cursor:'pointer' }}>Cancel</button>
            <button onClick={()=>mut.mutate()} disabled={mut.isPending} style={{ padding:'8px 20px', background:'var(--gold-400)', color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {mut.isPending ? 'Adding...' : 'Add to Pipeline →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Ideas({ onToast }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newIdea, setNewIdea] = useState('')
  const [promoting, setPromoting] = useState(null)
  const qc = useQueryClient()

  const { data: ideas=[], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: api.ideas,
    refetchInterval: 60_000,
  })

  const addMut = useMutation({
    mutationFn: api.addIdea,
    onSuccess: () => { qc.invalidateQueries(['ideas']); setNewIdea(''); setShowAdd(false); onToast('Idea captured', '💡') },
    onError: () => onToast('Failed to save idea', '✖'),
  })

  const unpromoted = ideas.filter(i => !i.promoted_to_content)
  const promoted   = ideas.filter(i => i.promoted_to_content)

  const deleteMut = useMutation({
    mutationFn: api.deleteIdea,
    onSuccess: () => { qc.invalidateQueries(['ideas']); onToast('Idea deleted', '✕') },
    onError: () => onToast('Failed to delete', '✖'),
  })
  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' })
  }

  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .4s ease both' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Ideas</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{unpromoted.length} open</div>
              <button onClick={()=>setShowAdd(s=>!s)} style={{
                fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 12px',
                background: showAdd ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.05)',
                color: showAdd ? 'var(--gold-400)' : 'var(--muted)',
                border:`1px solid ${showAdd ? 'rgba(201,160,48,.25)' : 'rgba(255,255,255,.08)'}`,
                borderRadius:'var(--rs)', cursor:'pointer',
              }}>+ Capture</button>
            </div>
          </div>

          {showAdd && (
            <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', background:'rgba(255,255,255,.02)', display:'flex', flexDirection:'column', gap:8 }}>
              <textarea
                value={newIdea} onChange={e=>setNewIdea(e.target.value)}
                placeholder="What's the idea?"
                rows={2}
                style={{ ...inp, width:'100%', resize:'vertical' }}
                autoFocus
              />
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={()=>setShowAdd(false)} style={{ padding:'6px 12px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer' }}>Cancel</button>
                <button onClick={()=>addMut.mutate({ title:newIdea, notes:newIdea, pillar:'build_the_business', source:'dashboard', priority:2 })} disabled={!newIdea.trim()||addMut.isPending} style={{ padding:'6px 14px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer' }}>Save</button>
              </div>
            </div>
          )}

          <div style={{ padding:'4px 18px 14px' }}>
            {isLoading ? (
              <div style={{ textAlign:'center', padding:'24px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Loading...</div>
            ) : unpromoted.length === 0 && promoted.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>
                <div style={{ fontSize:24, opacity:.2, marginBottom:8 }}>💡</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>No ideas yet</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, marginTop:6, opacity:.6 }}>Try: "idea: [your idea]" via WhatsApp</div>
              </div>
            ) : (
              <>
                {unpromoted.length > 0 && (
                  <>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--gold-400)', padding:'12px 0 8px' }}>Open Ideas</div>
                    {unpromoted.map(idea => (
                      <IdeaCard key={idea.id} idea={idea} fmtDate={fmtDate} onPromote={()=>setPromoting(idea)} onDelete={()=>deleteMut.mutate(idea.id)}/>
                    ))}
                  </>
                )}
                {promoted.length > 0 && (
                  <>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'16px 0 8px', opacity:.6 }}>In Pipeline</div>
                    {promoted.map(idea => (
                      <IdeaCard key={idea.id} idea={idea} fmtDate={fmtDate} promoted/>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {promoting && (
        <PromoteModal
          idea={promoting}
          onClose={()=>setPromoting(null)}
          onToast={onToast}
        />
      )}
    </>
  )
}

function IdeaCard({ idea, fmtDate, onPromote, onDelete, promoted }) {
  const [hovering, setHovering] = useState(false)
  const p = PILLARS[idea.pillar] || { label:'General', color:'var(--muted)' }

  return (
    <div
      onMouseEnter={()=>setHovering(true)}
      onMouseLeave={()=>setHovering(false)}
      style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', gap:10, alignItems:'flex-start' }}
    >
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, color: promoted ? 'var(--muted)' : 'var(--cream)', lineHeight:1.5, textDecoration: promoted ? 'line-through' : 'none' }}>
          {idea.title || idea.notes}
        </div>
        <div style={{ display:'flex', gap:6, marginTop:6, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 7px', borderRadius:8, background:p.color+'1a', color:p.color }}>{p.label}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{fmtDate(idea.created_at)}</span>
          {promoted && <span style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 7px', borderRadius:8, background:'rgba(46,200,128,.1)', color:'var(--success)' }}>In Pipeline</span>}
        </div>
      </div>
      {hovering && !promoted && (
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          <button onClick={onPromote} style={{
            fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 10px',
            background:'rgba(201,160,48,.1)', color:'var(--gold-400)',
            border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)', cursor:'pointer',
          }}>→ Pipeline</button>
          <button onClick={onDelete} style={{
            fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 8px',
            background:'rgba(224,90,90,.08)', color:'var(--danger)',
            border:'1px solid rgba(224,90,90,.15)', borderRadius:'var(--rs)', cursor:'pointer',
          }}>✕</button>
        </div>
      )}
    </div>
  )
}

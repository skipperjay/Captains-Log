import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PILLARS, guessPillar } from '../lib/constants'
import { api } from '../lib/api'
import AddContent from './AddContent'

const STAGES = ['idea', 'in_progress', 'done']
const STAGE_LABELS = { idea:'Ideas', in_progress:'In Progress', done:'Done' }
const STAGE_COLORS = { idea:'rgba(106,125,154,.15)', in_progress:'rgba(201,160,48,.1)', done:'rgba(46,200,128,.1)' }
const STAGE_ACCENT = { idea:'var(--muted)', in_progress:'var(--gold-400)', done:'var(--success)' }

function MoveMenu({ contentId, currentStage, onMove, onClose }) {
  const others = STAGES.filter(s => s !== currentStage)
  return (
    <div style={{
      position:'absolute', top:'100%', right:0, zIndex:50,
      background:'var(--navy-700)', border:'1px solid rgba(201,160,48,.2)',
      borderRadius:'var(--rs)', padding:6, minWidth:130,
      boxShadow:'0 8px 24px rgba(0,0,0,.4)', animation:'riseIn .15s ease',
    }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', padding:'4px 8px 6px' }}>Move to</div>
      {others.map(stage => (
        <button key={stage} onClick={() => { onMove(contentId, stage); onClose() }} style={{
          display:'block', width:'100%', textAlign:'left',
          padding:'7px 8px', background:'none', border:'none',
          color:'var(--cream)', fontSize:11, cursor:'pointer', borderRadius:4,
          fontFamily:'var(--font-body)',
        }}
          onMouseEnter={e=>e.target.style.background='rgba(255,255,255,.06)'}
          onMouseLeave={e=>e.target.style.background='none'}
        >
          {STAGE_LABELS[stage]}
        </button>
      ))}
    </div>
  )
}

function PipeCard({ item, stage, onMove, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pillar = item.pillar || guessPillar(item.title)
  const p = PILLARS[pillar] || { label:'Content', color:'var(--muted)' }

  return (
    <div style={{
      background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.05)',
      borderRadius:8, padding:'11px 12px', marginBottom:6,
      position:'relative', transition:'border-color var(--t)',
    }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(201,160,48,.18)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.05)'}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'var(--cream)', lineHeight:1.4, flex:1 }}>{item.title}</div>
        <div style={{ display:'flex', gap:3, flexShrink:0 }}>
          <button onClick={()=>setMenuOpen(o=>!o)} style={{
            background:'rgba(255,255,255,.06)', border:'none', color:'var(--muted)',
            borderRadius:4, padding:'2px 6px', cursor:'pointer', fontSize:11,
          }} title="Move stage">⇄</button>
          <button onClick={()=>onDelete(item.id)} style={{
            background:'rgba(224,90,90,.08)', border:'none', color:'var(--danger)',
            borderRadius:4, padding:'2px 6px', cursor:'pointer', fontSize:11,
          }} title="Delete">✕</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:4, marginTop:7, flexWrap:'wrap' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 7px', borderRadius:8, background:p.color+'18', color:p.color }}>
          {p.label.split(' ').slice(-1)[0]}
        </span>
        {item.format && (
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 7px', borderRadius:8, background:'rgba(255,255,255,.04)', color:'var(--muted)' }}>
            {item.format.replace(/_/g,' ')}
          </span>
        )}
      </div>
      {menuOpen && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={()=>setMenuOpen(false)}/>
          <MoveMenu contentId={item.id} currentStage={stage} onMove={onMove} onClose={()=>setMenuOpen(false)}/>
        </>
      )}
    </div>
  )
}

export default function Pipeline({ pipeline=[], onToast }) {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const deleteMut = useMutation({
    mutationFn: (id) => api.deleteContent(id),
    onSuccess: () => { qc.invalidateQueries(['dashboard']); qc.invalidateQueries(['content']); onToast('Deleted', '✕') },
    onError: () => onToast('Failed to delete', '✖'),
  })
    mutationFn: ({ id, stage }) => api.moveContent(id, stage),
    onSuccess: () => { qc.invalidateQueries(['dashboard']); qc.invalidateQueries(['content']); onToast('Moved', '⬡') },
    onError: () => onToast('Failed to move', '✖'),
  })

  // Map pipeline data to simplified 3-stage view
  const map = { idea:{ total:0, items:[] }, in_progress:{ total:0, items:[] }, done:{ total:0, items:[] } }

  pipeline.forEach(p => {
    // Map old stages to new 3-stage system
    const stageMap = { backlog:'idea', in_progress:'in_progress', review:'in_progress', approved:'in_progress', done:'done' }
    const mapped = stageMap[p.stage] || 'idea'
    if (map[mapped]) {
      map[mapped].total += parseInt(p.total)||0
      const items = (p.content_titles||[]).map((title,i) => ({
        id: p.content_ids?.[i] || `${p.stage}-${i}`,
        title,
        pillar: p.content_pillars?.[i],
        format: p.content_formats?.[i],
      }))
      map[mapped].items.push(...items)
    }
  })

  const total = Object.values(map).reduce((a,s)=>a+s.total,0)

  return (
    <>
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Content Pipeline</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{total} pieces</div>
            <button onClick={()=>setShowAdd(true)} style={{
              fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 12px',
              background:'rgba(201,160,48,.1)', color:'var(--gold-400)',
              border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)', cursor:'pointer',
            }}>+ Add</button>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <div className="pipeline-board" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, padding:16 }}>
            {STAGES.map(stage => {
              const col = map[stage]
              return (
                <div key={stage}>
                  <div style={{
                    fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase',
                    color: STAGE_ACCENT[stage], padding:'6px 10px', marginBottom:8,
                    background: STAGE_COLORS[stage], borderRadius:'var(--rs)',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                  }}>
                    {STAGE_LABELS[stage]}
                    <span style={{ background:'rgba(255,255,255,.08)', color:'var(--cream)', fontSize:9, padding:'1px 6px', borderRadius:8 }}>{col.total}</span>
                  </div>
                  {col.items.length > 0
                    ? col.items.map(item => (
                        <PipeCard key={item.id} item={item} stage={stage} onMove={(id,s)=>moveMut.mutate({id,stage:s})} onDelete={id=>deleteMut.mutate(id)}/>
                      ))
                    : <div style={{ color:'var(--muted)', fontSize:10, padding:'16px 6px', textAlign:'center', opacity:.3 }}>Empty</div>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {showAdd && <AddContent onClose={()=>setShowAdd(false)} onToast={onToast}/>}
    </>
  )
}

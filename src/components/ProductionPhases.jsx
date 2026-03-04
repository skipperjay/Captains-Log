import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const PHASES = ['script', 'video', 'editing', 'thumbnail', 'upload']
const PHASE_LABELS = {
  script:    { label: 'Script',    icon: '✍️' },
  video:     { label: 'Video',     icon: '🎥' },
  editing:   { label: 'Editing',   icon: '✂️' },
  thumbnail: { label: 'Thumbnail', icon: '🖼️' },
  upload:    { label: 'Upload',    icon: '🚀' },
}

function fmt(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

const inp = {
  background: 'var(--navy-800)',
  border: '1px solid rgba(255,255,255,.07)',
  borderRadius: 'var(--rs)',
  padding: '7px 10px',
  color: 'var(--cream)',
  fontSize: 12,
  outline: 'none',
  fontFamily: 'var(--font-body)',
  width: '100%',
}

export default function ProductionPhases({ contentId, phases = [], onToast }) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(null)
  const [editData, setEditData] = useState({})

  // Build phase map
  const phaseMap = {}
  phases.forEach(p => { phaseMap[p.phase] = p })

  // Current active phase — first incomplete
  const currentPhaseIdx = PHASES.findIndex(p => !phaseMap[p]?.completed)
  const completedCount = PHASES.filter(p => phaseMap[p]?.completed).length
  const pct = Math.round((completedCount / PHASES.length) * 100)

  const updateMut = useMutation({
    mutationFn: ({ phase, data }) => api.updateContentPhase(contentId, phase, data),
    onSuccess: () => {
      qc.invalidateQueries(['content-item', contentId])
      qc.invalidateQueries(['content'])
      onToast('Phase updated', '✓')
    },
    onError: () => onToast('Failed to update phase', '✖'),
  })

  function handleSave(phase) {
    const data = editData[phase] || {}
    updateMut.mutate({ phase, data })
    setExpanded(null)
  }

  function toggleComplete(phase) {
    const p = phaseMap[phase]
    const nowComplete = !p?.completed
    updateMut.mutate({
      phase,
      data: {
        completed: nowComplete,
        completed_at: nowComplete ? new Date().toISOString() : null,
        mins_spent: p?.mins_spent || 0,
        notes: p?.notes || '',
      }
    })
  }

  return (
    <div style={{
      background: 'var(--navy-900)',
      border: '1px solid rgba(255,255,255,.05)',
      borderRadius: 'var(--r)',
      padding: '16px 18px',
      marginTop: 12,
    }}>
      {/* Header + progress */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>
          Production
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:80, height:4, background:'rgba(255,255,255,.06)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:'var(--gold-400)', borderRadius:4, transition:'width .4s ease' }}/>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--gold-400)' }}>{completedCount}/{PHASES.length}</span>
        </div>
      </div>

      {/* Phase steps */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {PHASES.map((phase, idx) => {
          const p = phaseMap[phase] || {}
          const isComplete = p.completed
          const isCurrent = idx === currentPhaseIdx
          const isExpanded = expanded === phase
          const ed = editData[phase] || {}

          return (
            <div key={phase}>
              {/* Phase row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : phase)}
                style={{
                  display: 'flex', alignItems: 'center', gap:10,
                  padding: '10px 12px',
                  background: isCurrent ? 'rgba(201,160,48,.06)' : 'rgba(255,255,255,.02)',
                  border: `1px solid ${isCurrent ? 'rgba(201,160,48,.2)' : isComplete ? 'rgba(46,200,128,.15)' : 'rgba(255,255,255,.04)'}`,
                  borderRadius: 'var(--rs)',
                  cursor: 'pointer',
                  transition: 'all var(--t)',
                }}
              >
                {/* Complete toggle */}
                <button
                  onClick={e => { e.stopPropagation(); toggleComplete(phase) }}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    background: isComplete ? 'var(--success)' : 'transparent',
                    border: `2px solid ${isComplete ? 'var(--success)' : isCurrent ? 'var(--gold-400)' : 'rgba(255,255,255,.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all var(--t)',
                  }}
                >
                  {isComplete && <span style={{ color:'white', fontSize:10, fontWeight:700 }}>✓</span>}
                </button>

                {/* Icon + label */}
                <span style={{ fontSize:14 }}>{PHASE_LABELS[phase].icon}</span>
                <span style={{
                  fontSize: 12, fontWeight: 500, flex: 1,
                  color: isComplete ? 'var(--muted)' : isCurrent ? 'var(--cream)' : 'rgba(255,255,255,.5)',
                  textDecoration: isComplete ? 'line-through' : 'none',
                }}>
                  {PHASE_LABELS[phase].label}
                </span>

                {/* Meta */}
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  {p.mins_spent > 0 && (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)' }}>
                      {p.mins_spent}m
                    </span>
                  )}
                  {isComplete && p.completed_at && (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--success)' }}>
                      {fmt(p.completed_at)}
                    </span>
                  )}
                  {isCurrent && !isComplete && (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--gold-400)', letterSpacing:.5 }}>
                      IN PROGRESS
                    </span>
                  )}
                  <span style={{ color:'var(--muted)', fontSize:10, opacity:.5 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  background: 'rgba(255,255,255,.02)',
                  border: '1px solid rgba(255,255,255,.04)',
                  borderTop: 'none',
                  borderRadius: '0 0 var(--rs) var(--rs)',
                  padding: '12px 14px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginBottom:5, letterSpacing:1 }}>MINS SPENT</div>
                      <input
                        type="number"
                        placeholder="0"
                        defaultValue={p.mins_spent || ''}
                        onChange={e => setEditData(d => ({ ...d, [phase]: { ...d[phase], mins_spent: parseInt(e.target.value)||0 }}))}
                        style={{ ...inp }}
                      />
                    </div>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginBottom:5, letterSpacing:1 }}>COMPLETED DATE</div>
                      <input
                        type="date"
                        defaultValue={p.completed_at?.split('T')[0] || ''}
                        onChange={e => setEditData(d => ({ ...d, [phase]: { ...d[phase], completed_at: e.target.value ? new Date(e.target.value).toISOString() : null }}))}
                        style={{ ...inp }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginBottom:5, letterSpacing:1 }}>NOTES</div>
                    <textarea
                      placeholder={`Notes on ${PHASE_LABELS[phase].label.toLowerCase()}...`}
                      defaultValue={p.notes || ''}
                      rows={2}
                      onChange={e => setEditData(d => ({ ...d, [phase]: { ...d[phase], notes: e.target.value }}))}
                      style={{ ...inp, resize:'vertical', lineHeight:1.6 }}
                    />
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                    <button onClick={() => setExpanded(null)} style={{
                      padding:'6px 12px', background:'none', border:'1px solid rgba(255,255,255,.08)',
                      borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer',
                    }}>Cancel</button>
                    <button onClick={() => handleSave(phase)} style={{
                      padding:'6px 14px', background:'var(--gold-400)', border:'none',
                      borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer',
                    }}>Save</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

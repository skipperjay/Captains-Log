import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const inp = {
  background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,.07)',
  borderRadius: 'var(--rs)', padding: '8px 11px', color: 'var(--cream)',
  fontSize: 12, outline: 'none', fontFamily: 'var(--font-body)', width: '100%',
}

async function parseWithClaude(text) {
  const prompt = `Parse this text and extract project information. Return ONLY valid JSON, no markdown, no explanation.

Text:
${text}

Return this exact JSON structure:
{
  "name": "project name",
  "description": "brief description of what the project is",
  "target_date": null,
  "milestones": [
    { "title": "milestone title", "completed": false }
  ]
}

Rules:
- Extract the project name from headings, titles, or first line
- Extract description from any overview/about text
- Extract milestones from numbered lists, phases, checkboxes, or task lists
- If a milestone has ✅, [x], or "done" mark completed: true
- If target_date is mentioned extract it as YYYY-MM-DD, otherwise null
- Keep milestone titles concise
- Return only the JSON object, nothing else`

  const BASE = import.meta.env.VITE_API_URL || '/api'
  const response = await fetch(`${BASE}/ai/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const result = await response.json()
  const raw = result.content?.[0]?.text || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export default function ImportProject({ onClose, onToast }) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [preview, setPreview] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)

  async function handleParse() {
    if (!text.trim()) return
    setParsing(true)
    setError(null)
    setPreview(null)
    try {
      const parsed = await parseWithClaude(text)
      setPreview(parsed)
    } catch (e) {
      setError('Could not parse text. Try pasting a cleaner list or README.')
    }
    setParsing(false)
  }

  const createMut = useMutation({
    mutationFn: async () => {
      const project = await api.createProject({
        name: preview.name,
        description: preview.description,
        target_date: preview.target_date || null,
        status: 'active',
      })
      // Add milestones sequentially
      for (const m of preview.milestones) {
        const ms = await api.addMilestone(project.id, { title: m.title })
        if (m.completed) {
          await api.updateMilestone(ms.id, { completed: true })
        }
      }
      return project
    },
    onSuccess: () => {
      qc.invalidateQueries(['projects'])
      onToast('Project imported', '🚀')
      onClose()
    },
    onError: () => onToast('Failed to import project', '✖'),
  })

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--r)', width:'100%', maxWidth:560, maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'riseIn .3s ease', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }}/>

        {/* Header */}
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:15, fontWeight:700, color:'var(--cream)' }}>Import Project</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:3 }}>Paste a README, list, or notes — Claude will extract the project</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:22, overflow:'auto', flex:1, display:'flex', flexDirection:'column', gap:14 }}>

          {/* Paste area */}
          {!preview && (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Paste anything here:\n\n# My Project\nA tool for...\n\n## Milestones\n1. ✅ Phase 1 — Foundation\n2. Phase 2 — Build the UI\n3. Phase 3 — Deploy`}
                rows={10}
                style={{ ...inp, resize:'vertical', lineHeight:1.6 }}
                autoFocus
              />
              {error && (
                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--danger)' }}>{error}</div>
              )}
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={onClose} style={{ padding:'8px 16px', background:'none', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', fontSize:12, cursor:'pointer' }}>Cancel</button>
                <button onClick={handleParse} disabled={!text.trim() || parsing} style={{ padding:'8px 20px', background:'var(--gold-400)', color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer', opacity: (!text.trim() || parsing) ? .5 : 1 }}>
                  {parsing ? 'Parsing...' : 'Parse with Claude →'}
                </button>
              </div>
            </>
          )}

          {/* Preview */}
          {preview && (
            <>
              <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'var(--rs)', padding:16, display:'flex', flexDirection:'column', gap:12 }}>

                {/* Name */}
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>Project Name</div>
                  <input value={preview.name} onChange={e => setPreview(p => ({ ...p, name: e.target.value }))} style={inp}/>
                </div>

                {/* Description */}
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>Description</div>
                  <textarea value={preview.description || ''} onChange={e => setPreview(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inp, resize:'vertical' }}/>
                </div>

                {/* Milestones */}
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>
                    Milestones — {preview.milestones.length} found
                  </div>
                  {preview.milestones.map((m, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                      <button onClick={() => setPreview(p => ({ ...p, milestones: p.milestones.map((ms, j) => j === i ? { ...ms, completed: !ms.completed } : ms) }))}
                        style={{ width:16, height:16, borderRadius:4, flexShrink:0, cursor:'pointer', background: m.completed ? 'var(--success)' : 'transparent', border:`2px solid ${m.completed ? 'var(--success)' : 'rgba(255,255,255,.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t)' }}>
                        {m.completed && <span style={{ color:'white', fontSize:9, fontWeight:700 }}>✓</span>}
                      </button>
                      <input value={m.title}
                        onChange={e => setPreview(p => ({ ...p, milestones: p.milestones.map((ms, j) => j === i ? { ...ms, title: e.target.value } : ms) }))}
                        style={{ ...inp, padding:'4px 8px', fontSize:11, color: m.completed ? 'var(--muted)' : 'var(--cream)', textDecoration: m.completed ? 'line-through' : 'none' }}/>
                      <button onClick={() => setPreview(p => ({ ...p, milestones: p.milestones.filter((_, j) => j !== i) }))}
                        style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:12, flexShrink:0 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => setPreview(p => ({ ...p, milestones: [...p.milestones, { title:'', completed:false }] }))}
                    style={{ marginTop:8, fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 10px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'var(--rs)', color:'var(--muted)', cursor:'pointer' }}>
                    + Add milestone
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
                <button onClick={() => setPreview(null)} style={{ padding:'8px 14px', background:'none', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', fontSize:12, cursor:'pointer' }}>← Re-paste</button>
                <button onClick={() => createMut.mutate()} disabled={!preview.name.trim() || createMut.isPending} style={{ padding:'8px 24px', background:'var(--gold-400)', color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer', opacity: (!preview.name.trim() || createMut.isPending) ? .5 : 1 }}>
                  {createMut.isPending ? 'Importing...' : 'Import Project →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

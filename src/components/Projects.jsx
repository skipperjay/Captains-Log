import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import ProjectCopilot from './ProjectCopilot'
import ImportProject from './ImportProject'

const STATUS_CONFIG = {
  active: { label: 'Active',  color: 'var(--success)',   bg: 'rgba(46,200,128,.1)',  border: 'rgba(46,200,128,.2)'  },
  paused: { label: 'Paused',  color: 'var(--gold-400)',  bg: 'rgba(201,160,48,.1)',  border: 'rgba(201,160,48,.2)'  },
  done:   { label: 'Done',    color: 'var(--muted)',     bg: 'rgba(255,255,255,.05)', border: 'rgba(255,255,255,.1)' },
}

const inp = {
  background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,.07)',
  borderRadius: 'var(--rs)', padding: '8px 11px', color: 'var(--cream)',
  fontSize: 12, outline: 'none', fontFamily: 'var(--font-body)', width: '100%',
  transition: 'border-color var(--t)',
}

function AIMilestoneGenerator({ name, desc, onMilestonesGenerated }) {
  const [loading, setLoading] = useState(false)
  const [milestones, setMilestones] = useState(null) // [{title,checked,editing}]

  async function generate() {
    setLoading(true)
    try {
      const prompt = `You are a project planning assistant for a solopreneur named Jay who builds software products, creates content, and runs Skipper Media. Given the project name and description below, generate 6-10 specific, actionable milestones that represent the key steps to complete this project.

Project name: ${name}
Project description: ${desc || '(no description)'}

Respond ONLY with a JSON array of milestone titles, no preamble, no markdown backticks, no explanation. Example format:
["Milestone one", "Milestone two", "Milestone three"]

Make milestones specific and sequential. Each should represent a meaningful checkpoint, not a vague task.`

      const BASE = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${BASE}/ai/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      const text = (data.content || data.text || '').trim()
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        const ms = parsed.map(t => ({ title: t, checked: true }))
        setMilestones(ms)
        onMilestonesGenerated(ms)
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  function toggle(i) {
    setMilestones(prev => {
      const next = prev.map((m,j) => j===i ? { ...m, checked:!m.checked } : m)
      onMilestonesGenerated(next)
      return next
    })
  }
  function updateTitle(i, title) {
    setMilestones(prev => {
      const next = prev.map((m,j) => j===i ? { ...m, title } : m)
      onMilestonesGenerated(next)
      return next
    })
  }
  function remove(i) {
    setMilestones(prev => {
      const next = prev.filter((_,j) => j!==i)
      onMilestonesGenerated(next)
      return next
    })
  }
  function addBlank() {
    setMilestones(prev => {
      const next = [...(prev||[]), { title:'', checked:true }]
      onMilestonesGenerated(next)
      return next
    })
  }

  return (
    <div>
      {!milestones && (
        <button onClick={generate} disabled={loading || !name.trim()} style={{
          fontFamily:'var(--font-mono)', fontSize:9, padding:'7px 14px',
          background:'rgba(201,160,48,.1)', color:'var(--gold-400)',
          border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)',
          cursor: loading || !name.trim() ? 'default' : 'pointer', width:'100%',
          opacity: !name.trim() ? .4 : 1,
        }}>
          {loading ? (
            <span style={{ display:'inline-flex', gap:3, alignItems:'center' }}>
              Generating<span className="loading-dots" style={{ display:'inline-flex', gap:2 }}>
                {[0,1,2].map(i=><span key={i} style={{ width:3, height:3, borderRadius:'50%', background:'var(--gold-400)', animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}
              </span>
            </span>
          ) : 'Generate Milestones with AI'}
        </button>
      )}
      {milestones && (
        <div style={{ background:'var(--navy-800)', borderRadius:'var(--rs)', padding:12, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, color:'var(--muted)', textTransform:'uppercase' }}>AI Milestones</div>
            <button onClick={()=>{setMilestones(null);onMilestonesGenerated(null)}} style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 6px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', cursor:'pointer' }}>↺ Regenerate</button>
          </div>
          {milestones.map((m,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0' }}>
              <button onClick={()=>toggle(i)} style={{
                width:16, height:16, borderRadius:4, flexShrink:0, cursor:'pointer',
                background: m.checked ? 'var(--gold-400)' : 'transparent',
                border: `2px solid ${m.checked ? 'var(--gold-400)' : 'rgba(255,255,255,.2)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t)',
              }}>
                {m.checked && <span style={{ color:'var(--navy-900)', fontSize:9, fontWeight:700 }}>✓</span>}
              </button>
              <input value={m.title} onChange={e=>updateTitle(i,e.target.value)} style={{ ...inp, flex:1, fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 8px', background:'transparent', border:'1px solid transparent', opacity: m.checked ? 1 : .5 }}
                onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}
                onBlur={e=>e.target.style.borderColor='transparent'}
              />
              <button onClick={()=>remove(i)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:11, padding:'2px 4px', opacity:.5 }}>✕</button>
            </div>
          ))}
          <button onClick={addBlank} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', background:'none', border:'1px dashed rgba(255,255,255,.1)', borderRadius:'var(--rs)', padding:'6px', cursor:'pointer', marginTop:4 }}>+ Add milestone</button>
        </div>
      )}
    </div>
  )
}

function AddProjectModal({ onClose, onToast }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [aiMilestones, setAiMilestones] = useState(null)

  const mut = useMutation({
    mutationFn: async (body) => {
      const project = await api.createProject(body)
      if (aiMilestones?.length) {
        const checked = aiMilestones.filter(m => m.checked && m.title.trim())
        await Promise.all(checked.map(m => api.addMilestone(project.id, { title: m.title })))
      }
      return project
    },
    onSuccess: () => { qc.invalidateQueries(['projects']); onToast('Project created', '🚀'); onClose() },
    onError: () => onToast('Failed to create project', '✖'),
  })

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--r)', width:'100%', maxWidth:440, position:'relative', overflow:'hidden', animation:'riseIn .3s ease', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }}/>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:15, fontWeight:700, color:'var(--cream)' }}>New Project</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Project Name *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Captain's Log" style={inp} autoFocus/>
          </div>
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Description</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What is this project?" rows={2} style={{ ...inp, resize:'vertical' }}/>
          </div>
          <div>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:5 }}>Target Date</label>
            <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} style={inp}/>
          </div>
          <AIMilestoneGenerator name={name} desc={desc} onMilestonesGenerated={setAiMilestones}/>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4 }}>
            <button onClick={onClose} style={{ padding:'8px 16px', background:'none', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', fontSize:12, cursor:'pointer' }}>Cancel</button>
            <button onClick={()=>mut.mutate({ name, description:desc, target_date:targetDate||null })} disabled={!name.trim()||mut.isPending} style={{ padding:'8px 20px', background:'var(--gold-400)', color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {mut.isPending ? 'Creating...' : 'Create Project →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, onToast }) {
  const [expanded, setExpanded] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const [showMilestoneInput, setShowMilestoneInput] = useState(false)
  const [newUpdate, setNewUpdate] = useState('')
  const [newMins, setNewMins] = useState('')
  const [showUpdateInput, setShowUpdateInput] = useState(false)
  const [copilotTrigger, setCopilotTrigger] = useState(0)
  const [lastUpdateText, setLastUpdateText] = useState('')
  const [suggestMilestones, setSuggestMilestones] = useState(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const qc = useQueryClient()

  const milestones = (project.milestones || []).filter(m => m && m.id).sort((a,b) => a.id - b.id)
  const updates    = (project.updates   || []).filter(u => u && u.id).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
  const totalMins  = parseInt(project.total_mins_logged) || 0
  const totalMs    = parseInt(project.total_milestones) || 0
  const doneMils   = parseInt(project.completed_milestones) || 0
  const pct        = totalMs > 0 ? Math.round((doneMils / totalMs) * 100) : 0
  const s          = STATUS_CONFIG[project.status] || STATUS_CONFIG.active

  const daysLeft = project.target_date
    ? Math.ceil((new Date(project.target_date) - new Date()) / 86400000)
    : null

  const toggleMilestone = useMutation({
    mutationFn: ({ id, completed }) => api.updateMilestone(id, { completed }),
    onSuccess: () => qc.invalidateQueries(['projects']),
    onError: () => onToast('Failed to update milestone', '✖'),
  })

  const addMilestone = useMutation({
    mutationFn: (title) => api.addMilestone(project.id, { title }),
    onSuccess: () => { qc.invalidateQueries(['projects']); setNewMilestone(''); setShowMilestoneInput(false) },
    onError: () => onToast('Failed to add milestone', '✖'),
  })

  const deleteMilestone = useMutation({
    mutationFn: api.deleteMilestone,
    onSuccess: () => qc.invalidateQueries(['projects']),
    onError: () => onToast('Failed to delete milestone', '✖'),
  })

  const addUpdate = useMutation({
    mutationFn: ({ body, mins_logged }) => api.addProjectUpdate(project.id, { body, mins_logged }),
    onSuccess: () => {
      qc.invalidateQueries(['projects'])
      setLastUpdateText(newUpdate)
      setCopilotTrigger(t => t + 1)
      setNewUpdate(''); setNewMins(''); setShowUpdateInput(false)
      onToast('Update logged', '📝')
    },
    onError: () => onToast('Failed to log update', '✖'),
  })

  const deleteUpdate = useMutation({
    mutationFn: api.deleteProjectUpdate,
    onSuccess: () => qc.invalidateQueries(['projects']),
    onError: () => onToast('Failed to delete', '✖'),
  })

  const updateStatus = useMutation({
    mutationFn: (status) => api.updateProject(project.id, { status }),
    onSuccess: () => qc.invalidateQueries(['projects']),
    onError: () => onToast('Failed to update status', '✖'),
  })

  const deleteProject = useMutation({
    mutationFn: () => api.deleteProject(project.id),
    onSuccess: () => { qc.invalidateQueries(['projects']); onToast('Project deleted', '✕') },
    onError: () => onToast('Failed to delete project', '✖'),
  })

  function fmtMins(mins) {
    if (!mins) return '0h'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' })
  }

  return (
    <div style={{ background:'var(--navy-900)', border:`1px solid ${expanded ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.05)'}`, borderRadius:'var(--r)', overflow:'hidden', transition:'border-color var(--t)', marginBottom:12 }}>

      {/* Header */}
      <div style={{ padding:'16px 18px', cursor:'pointer' }} onClick={()=>setExpanded(e=>!e)}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color: project.status==='done' ? 'var(--muted)' : 'var(--cream)', textDecoration: project.status==='done' ? 'line-through' : 'none' }}>
                {project.name}
              </div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 7px', borderRadius:8, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                {s.label}
              </span>
            </div>
            {project.description && (
              <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5, marginBottom:8 }}>{project.description}</div>
            )}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {totalMs > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:80, height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background: pct===100 ? 'var(--success)' : 'var(--gold-400)', borderRadius:2, transition:'width .4s ease' }}/>
                  </div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{doneMils}/{totalMs} milestones</span>
                </div>
              )}
              {totalMins > 0 && (
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>⏱ {fmtMins(totalMins)} logged</span>
              )}
              {daysLeft !== null && (
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color: daysLeft < 7 ? 'var(--warn)' : daysLeft < 0 ? 'var(--danger)' : 'var(--muted)' }}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </span>
              )}
            </div>
          </div>
          <div style={{ color:'var(--muted)', fontSize:11, transition:'transform var(--t)', transform: expanded ? 'rotate(180deg)' : 'none', flexShrink:0, marginTop:2 }}>▾</div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,.04)' }}>

          {/* Milestones */}
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--gold-400)' }}>Milestones</div>
              <button onClick={()=>setShowMilestoneInput(s=>!s)} style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'3px 8px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', cursor:'pointer' }}>+ Add</button>
            </div>
            {milestones.length === 0 && !showMilestoneInput && !suggestMilestones && (
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', opacity:.6, marginBottom:8 }}>No milestones yet — add key steps to track progress</div>
            )}
            {milestones.length === 0 && !suggestMilestones && (
              <button onClick={async()=>{
                setSuggestLoading(true)
                try {
                  const prompt = `You are a project planning assistant for a solopreneur named Jay who builds software products, creates content, and runs Skipper Media. Given the project name and description below, generate 6-10 specific, actionable milestones that represent the key steps to complete this project.

Project name: ${project.name}
Project description: ${project.description || '(no description)'}

Respond ONLY with a JSON array of milestone titles, no preamble, no markdown backticks, no explanation. Example format:
["Milestone one", "Milestone two", "Milestone three"]

Make milestones specific and sequential. Each should represent a meaningful checkpoint, not a vague task.`
                  const BASE = import.meta.env.VITE_API_URL || '/api'
                  const res = await fetch(`${BASE}/ai/complete`, {
                    method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ messages:[{role:'user',content:prompt}] }),
                  })
                  const data = await res.json()
                  const text = (data.content||data.text||'').trim()
                  const parsed = JSON.parse(text)
                  if (Array.isArray(parsed)) setSuggestMilestones(parsed.map(t=>({title:t,checked:true})))
                } catch {}
                setSuggestLoading(false)
              }} disabled={suggestLoading} style={{
                fontFamily:'var(--font-mono)', fontSize:9, padding:'7px 14px', width:'100%',
                background:'rgba(201,160,48,.1)', color:'var(--gold-400)',
                border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)',
                cursor: suggestLoading ? 'default' : 'pointer', marginBottom:8,
              }}>
                {suggestLoading ? (
                  <span style={{ display:'inline-flex', gap:3, alignItems:'center' }}>
                    Generating<span style={{ display:'inline-flex', gap:2 }}>
                      {[0,1,2].map(i=><span key={i} style={{ width:3, height:3, borderRadius:'50%', background:'var(--gold-400)', animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}
                    </span>
                  </span>
                ) : 'Suggest Milestones'}
              </button>
            )}
            {suggestMilestones && (
              <div style={{ background:'var(--navy-800)', borderRadius:'var(--rs)', padding:10, marginBottom:8 }}>
                {suggestMilestones.map((m,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0' }}>
                    <button onClick={()=>setSuggestMilestones(prev=>prev.map((x,j)=>j===i?{...x,checked:!x.checked}:x))} style={{
                      width:16, height:16, borderRadius:4, flexShrink:0, cursor:'pointer',
                      background: m.checked ? 'var(--gold-400)' : 'transparent',
                      border:`2px solid ${m.checked ? 'var(--gold-400)' : 'rgba(255,255,255,.2)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t)',
                    }}>
                      {m.checked && <span style={{ color:'var(--navy-900)', fontSize:9, fontWeight:700 }}>✓</span>}
                    </button>
                    <input value={m.title} onChange={e=>setSuggestMilestones(prev=>prev.map((x,j)=>j===i?{...x,title:e.target.value}:x))} style={{ ...inp, flex:1, fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 8px', background:'transparent', border:'1px solid transparent', opacity:m.checked?1:.5 }}
                      onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}
                      onBlur={e=>e.target.style.borderColor='transparent'}
                    />
                    <button onClick={()=>setSuggestMilestones(prev=>prev.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:11, padding:'2px 4px', opacity:.5 }}>✕</button>
                  </div>
                ))}
                <div style={{ display:'flex', gap:6, marginTop:8 }}>
                  <button onClick={async()=>{
                    const checked = suggestMilestones.filter(m=>m.checked&&m.title.trim())
                    await Promise.all(checked.map(m=>api.addMilestone(project.id,{title:m.title})))
                    qc.invalidateQueries(['projects'])
                    setSuggestMilestones(null)
                    onToast(`${checked.length} milestones added`,'✓')
                  }} style={{ padding:'6px 12px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-mono)' }}>
                    Save {suggestMilestones.filter(m=>m.checked&&m.title.trim()).length} Milestones
                  </button>
                  <button onClick={()=>setSuggestMilestones(null)} style={{ padding:'6px 10px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:10, cursor:'pointer', fontFamily:'var(--font-mono)' }}>Cancel</button>
                </div>
              </div>
            )}
            {milestones.map(m => (
              <MilestoneRow key={m.id} milestone={m}
                onToggle={()=>toggleMilestone.mutate({ id:m.id, completed:!m.completed })}
                onDelete={()=>deleteMilestone.mutate(m.id)}
              />
            ))}
            {showMilestoneInput && (
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <input value={newMilestone} onChange={e=>setNewMilestone(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&newMilestone.trim()&&addMilestone.mutate(newMilestone)}
                  placeholder="Milestone title..." style={{ ...inp, flex:1 }} autoFocus/>
                <button onClick={()=>newMilestone.trim()&&addMilestone.mutate(newMilestone)} style={{ padding:'6px 12px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer' }}>Add</button>
                <button onClick={()=>setShowMilestoneInput(false)} style={{ padding:'6px 10px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer' }}>✕</button>
              </div>
            )}
          </div>

          {/* Log update */}
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--gold-400)' }}>Updates</div>
              <button onClick={()=>setShowUpdateInput(s=>!s)} style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'3px 8px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', cursor:'pointer' }}>+ Log</button>
            </div>
            {showUpdateInput && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                <textarea value={newUpdate} onChange={e=>setNewUpdate(e.target.value)} placeholder="What did you work on?" rows={2} style={{ ...inp, resize:'vertical' }} autoFocus/>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="number" value={newMins} onChange={e=>setNewMins(e.target.value)} placeholder="Mins worked" style={{ ...inp, width:120 }}/>
                  <button onClick={()=>newUpdate.trim()&&addUpdate.mutate({ body:newUpdate, mins_logged:newMins?parseInt(newMins):null })} disabled={!newUpdate.trim()} style={{ padding:'7px 14px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer' }}>Log Update</button>
                  <button onClick={()=>setShowUpdateInput(false)} style={{ padding:'7px 10px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer' }}>✕</button>
                </div>
              </div>
            )}
            {updates.length === 0 && !showUpdateInput ? (
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', opacity:.6 }}>No updates yet</div>
            ) : updates.slice(0,5).map(u => (
              <UpdateRow key={u.id} update={u} fmtDate={fmtDate} fmtMins={fmtMins} onDelete={()=>deleteUpdate.mutate(u.id)}/>
            ))}
            <ProjectCopilot
              project={project}
              trigger={copilotTrigger}
              updateText={lastUpdateText}
            />
          </div>

          {/* Footer actions */}
          <div style={{ padding:'10px 18px', display:'flex', gap:6, flexWrap:'wrap' }}>
            {Object.entries(STATUS_CONFIG).filter(([k])=>k!==project.status).map(([k,v])=>(
              <button key={k} onClick={()=>updateStatus.mutate(k)} style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'4px 10px', background:v.bg, color:v.color, border:`1px solid ${v.border}`, borderRadius:'var(--rs)', cursor:'pointer' }}>
                → Mark {v.label}
              </button>
            ))}
            <button onClick={()=>{ if(window.confirm('Delete this project and all its data?')) deleteProject.mutate() }} style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'4px 10px', background:'rgba(224,90,90,.08)', color:'var(--danger)', border:'1px solid rgba(224,90,90,.15)', borderRadius:'var(--rs)', cursor:'pointer', marginLeft:'auto' }}>
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MilestoneRow({ milestone, onToggle, onDelete }) {
  const [hovering, setHovering] = useState(false)
  return (
    <div onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
      <button onClick={onToggle} style={{
        width:16, height:16, borderRadius:4, flexShrink:0, cursor:'pointer',
        background: milestone.completed ? 'var(--success)' : 'transparent',
        border: `2px solid ${milestone.completed ? 'var(--success)' : 'rgba(255,255,255,.2)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all var(--t)',
      }}>
        {milestone.completed && <span style={{ color:'white', fontSize:9, fontWeight:700 }}>✓</span>}
      </button>
      <div style={{ flex:1, fontSize:12, color: milestone.completed ? 'var(--muted)' : 'var(--cream)', textDecoration: milestone.completed ? 'line-through' : 'none' }}>
        {milestone.title}
      </div>
      {hovering && (
        <button onClick={onDelete} style={{ background:'rgba(224,90,90,.08)', border:'1px solid rgba(224,90,90,.15)', color:'var(--danger)', borderRadius:4, padding:'1px 6px', fontSize:10, cursor:'pointer' }}>✕</button>
      )}
    </div>
  )
}

function UpdateRow({ update, fmtDate, fmtMins, onDelete }) {
  const [hovering, setHovering] = useState(false)
  return (
    <div onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}
      style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.03)', display:'flex', gap:8, alignItems:'flex-start' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, color:'var(--cream)', lineHeight:1.5 }}>{update.body}</div>
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{fmtDate(update.created_at)}</span>
          {update.mins_logged && <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--gold-400)' }}>⏱ {fmtMins(update.mins_logged)}</span>}
          {update.source === 'whatsapp' && <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', opacity:.6 }}>via WhatsApp</span>}
        </div>
      </div>
      {hovering && (
        <button onClick={onDelete} style={{ background:'rgba(224,90,90,.08)', border:'1px solid rgba(224,90,90,.15)', color:'var(--danger)', borderRadius:4, padding:'1px 6px', fontSize:10, cursor:'pointer', flexShrink:0 }}>✕</button>
      )}
    </div>
  )
}

export default function Projects({ onToast }) {
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const { data: projects=[], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects,
    refetchInterval: 60_000,
  })

  const active = projects.filter(p => p.status === 'active')
  const paused = projects.filter(p => p.status === 'paused')
  const done   = projects.filter(p => p.status === 'done')

  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .4s ease both' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Projects</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:2 }}>{active.length} active · {paused.length} paused · {done.length} done</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setShowImport(true)} style={{
                fontFamily:'var(--font-mono)', fontSize:9, padding:'6px 12px',
                background:'rgba(255,255,255,.04)', color:'var(--muted)',
                border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', cursor:'pointer',
              }}>⬆ Import</button>
              <button onClick={()=>setShowAdd(true)} style={{
                fontFamily:'var(--font-mono)', fontSize:9, padding:'6px 14px',
                background:'rgba(201,160,48,.1)', color:'var(--gold-400)',
                border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)', cursor:'pointer',
              }}>+ New Project</button>
            </div>
          </div>

          <div style={{ padding:'16px 18px' }}>
            {isLoading ? (
              <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Loading...</div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                <div style={{ fontSize:28, opacity:.2, marginBottom:8 }}>🚀</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>No projects yet</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, marginTop:6, opacity:.6 }}>Click + New Project to get started</div>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--success)', marginBottom:10 }}>Active</div>
                    {active.map(p => <ProjectCard key={p.id} project={p} onToast={onToast}/>)}
                  </>
                )}
                {paused.length > 0 && (
                  <>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--gold-400)', marginTop:16, marginBottom:10 }}>Paused</div>
                    {paused.map(p => <ProjectCard key={p.id} project={p} onToast={onToast}/>)}
                  </>
                )}
                {done.length > 0 && (
                  <>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginTop:16, marginBottom:10, opacity:.6 }}>Completed</div>
                    {done.map(p => <ProjectCard key={p.id} project={p} onToast={onToast}/>)}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAdd && <AddProjectModal onClose={()=>setShowAdd(false)} onToast={onToast}/>}
      {showImport && <ImportProject onClose={()=>setShowImport(false)} onToast={onToast}/>}
    </>
  )
}

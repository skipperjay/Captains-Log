import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { fmtDate } from '../lib/constants'

function TodoItem({ todo, onComplete, onDelete, onSnooze }) {
  const [hovering, setHovering] = useState(false)
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed
  const isCalendar = todo.source === 'google_calendar'

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,.04)', transition:'background var(--t)' }}
    >
      {/* Checkbox */}
      <button onClick={() => !isCalendar && onComplete(todo.id)} style={{
        width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:2,
        border:`2px solid ${todo.completed ? 'var(--success)' : isCalendar ? 'rgba(99,179,237,.3)' : 'rgba(255,255,255,.15)'}`,
        background: todo.completed ? 'var(--success)' : 'transparent',
        cursor: isCalendar ? 'default' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all var(--t)',
      }}>
        {todo.completed && <span style={{ color:'var(--navy-900)', fontSize:10, fontWeight:700 }}>✓</span>}
      </button>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:500, color: todo.completed ? 'var(--muted)' : 'var(--cream)', textDecoration: todo.completed ? 'line-through' : 'none', lineHeight:1.4, wordBreak:'break-word' }}>
          {todo.task}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, marginTop:3, color: isOverdue ? 'var(--danger)' : 'var(--muted)', display:'flex', alignItems:'center', gap:5 }}>
          {isCalendar && <span title="Google Calendar">📅</span>}
          {isOverdue ? '⚠ Overdue · ' : ''}
          {todo.due_date ? fmtDate(todo.due_date) : ''}
        </div>
      </div>

      {/* Actions — show on hover, only for Waypoint todos */}
      {!isCalendar && hovering && !todo.completed && (
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          <button onClick={() => onSnooze(todo.id)} title="Snooze 1 day" style={{
            fontFamily:'var(--font-mono)', fontSize:9, padding:'2px 7px',
            background:'rgba(255,255,255,.05)', color:'var(--muted)',
            border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', cursor:'pointer',
          }}>+1d</button>
          <button onClick={() => onDelete(todo.id)} title="Delete" style={{
            fontFamily:'var(--font-mono)', fontSize:9, padding:'2px 7px',
            background:'rgba(224,90,90,.08)', color:'var(--danger)',
            border:'1px solid rgba(224,90,90,.15)', borderRadius:'var(--rs)', cursor:'pointer',
          }}>✕</button>
        </div>
      )}
    </div>
  )
}

export default function Todos({ todos = [], onToast }) {
  const [showAll, setShowAll] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newDate, setNewDate] = useState('')
  const qc = useQueryClient()

  const completeMut = useMutation({
    mutationFn: api.completeTodo,
    onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Task complete ✓', '✓') },
    onError: () => onToast('Failed to update', '✖'),
  })

  const addMut = useMutation({
    mutationFn: (body) => api.addWaypointTodo(body),
    onSuccess: () => { qc.invalidateQueries(['todos']); setNewTask(''); setNewDate(''); setShowAdd(false); onToast('Todo added', '✦') },
    onError: () => onToast('Failed to add todo', '✖'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.deleteTodo(id),
    onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Removed', '✕') },
    onError: () => onToast('Failed to delete', '✖'),
  })

  const snoozeMut = useMutation({
    mutationFn: (id) => api.snoozeTodo(id),
    onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Snoozed 1 day', '⏰') },
    onError: () => onToast('Failed to snooze', '✖'),
  })

  function addTodo() {
    if (!newTask.trim()) return
    addMut.mutate({ task: newTask.trim(), due_date: newDate || null })
  }

  const today = new Date().toISOString().split('T')[0]
  const waypointTodos = todos.filter(t => t.source !== 'google_calendar')
  const calendarTodos = todos.filter(t => t.source === 'google_calendar')
  const open = waypointTodos.filter(t => !t.completed)
  const todayPriority = [...open.filter(t => !t.due_date || t.due_date <= today), ...calendarTodos.filter(t => t.due_date === today)]
  const upcoming = [...open.filter(t => t.due_date && t.due_date > today), ...calendarTodos.filter(t => t.due_date > today)]
  const completed = waypointTodos.filter(t => t.completed).slice(0, 3)

  const inp = { background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'var(--rs)', padding:'7px 10px', color:'var(--cream)', fontSize:12, outline:'none', fontFamily:'var(--font-body)' }

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .1s ease both' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Open Todos</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', letterSpacing:1 }}>{open.length + calendarTodos.length} open</div>
          <button onClick={() => setShowAdd(s=>!s)} style={{
            fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 10px',
            background: showAdd ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.05)',
            color: showAdd ? 'var(--gold-400)' : 'var(--muted)',
            border:`1px solid ${showAdd ? 'rgba(201,160,48,.25)' : 'rgba(255,255,255,.08)'}`,
            borderRadius:'var(--rs)', cursor:'pointer',
          }}>+ Add</button>
        </div>
      </div>

      {/* Add Todo Form */}
      {showAdd && (
        <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', background:'rgba(255,255,255,.02)', display:'flex', gap:8, flexWrap:'wrap' }}>
          <input
            value={newTask} onChange={e=>setNewTask(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addTodo()}
            placeholder="What needs to be done?"
            style={{ ...inp, flex:1, minWidth:180 }}
            autoFocus
          />
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{ ...inp, width:140 }} />
          <button onClick={addTodo} disabled={!newTask.trim()||addMut.isPending} style={{
            padding:'7px 14px', background:'var(--gold-400)', color:'var(--navy-900)',
            border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer',
          }}>Save</button>
        </div>
      )}

      <div style={{ padding:'4px 18px 14px' }}>
        {/* Today / Priority */}
        {todayPriority.length > 0 && (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--gold-400)', padding:'12px 0 4px' }}>Today's Priorities</div>
            {todayPriority.map(t => (
              <TodoItem key={t.id} todo={t}
                onComplete={id=>completeMut.mutate(id)}
                onDelete={id=>deleteMut.mutate(id)}
                onSnooze={id=>snoozeMut.mutate(id)}
              />
            ))}
          </>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <button onClick={()=>setShowAll(s=>!s)} style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'12px 0 4px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, width:'100%' }}>
              <span>Upcoming</span>
              <span style={{ background:'rgba(255,255,255,.06)', padding:'1px 7px', borderRadius:8, fontSize:9, color:'var(--cream)' }}>{upcoming.length}</span>
              <span style={{ marginLeft:'auto' }}>{showAll?'▲':'▼'}</span>
            </button>
            {showAll && upcoming.map(t => (
              <TodoItem key={t.id} todo={t}
                onComplete={id=>completeMut.mutate(id)}
                onDelete={id=>deleteMut.mutate(id)}
                onSnooze={id=>snoozeMut.mutate(id)}
              />
            ))}
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'12px 0 4px', opacity:.5 }}>Recently Done</div>
            {completed.map(t => (
              <TodoItem key={t.id} todo={t} onComplete={()=>{}} onDelete={()=>{}} onSnooze={()=>{}} />
            ))}
          </>
        )}

        {todayPriority.length===0 && upcoming.length===0 && completed.length===0 && (
          <div style={{ textAlign:'center', padding:'28px 0', color:'var(--muted)' }}>
            <div style={{ fontSize:22, opacity:.3, marginBottom:8 }}>✓</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>All clear — add something above</div>
          </div>
        )}
      </div>
    </div>
  )
}

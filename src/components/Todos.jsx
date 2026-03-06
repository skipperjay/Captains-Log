import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { fmtDate } from '../lib/constants'

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.ceil((d - today) / 86400000)
}

function TodoItem({ todo, onComplete, onDelete, onSnooze, onUpdateDate }) {
  const [hovering, setHovering] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const isCalendar = todo.source === 'google_calendar'
  const days = todo.due_date ? daysUntil(todo.due_date) : null

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,.04)', transition:'background var(--t)' }}
    >
      {/* Checkbox */}
      <button onClick={() => !isCalendar && onComplete(todo.id)} style={{
        width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:2,
        border:`2px solid ${todo.completed ? 'var(--success)' : todo.is_overdue ? 'var(--danger)' : isCalendar ? 'rgba(99,179,237,.3)' : 'rgba(255,255,255,.15)'}`,
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
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, marginTop:3, color: todo.is_overdue ? 'var(--danger)' : 'var(--muted)', display:'flex', alignItems:'center', gap:5 }}>
          {isCalendar && <span title="Google Calendar">📅</span>}
          {todo.is_overdue ? '⚠ Overdue · ' : ''}
          {todo.due_date ? fmtDate(todo.due_date) : ''}
          {days !== null && days > 0 && !todo.is_overdue && (
            <span style={{ color:'var(--muted)' }}> · in {days}d</span>
          )}
        </div>
        {/* Inline date picker */}
        {showDatePicker && (
          <div style={{ marginTop:6 }}>
            <input
              type="date"
              defaultValue={todo.due_date || ''}
              onChange={e => { onUpdateDate(todo.id, e.target.value || null); setShowDatePicker(false) }}
              autoFocus
              onBlur={() => setTimeout(() => setShowDatePicker(false), 200)}
              style={{ background:'var(--navy-800)', border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)', padding:'4px 8px', color:'var(--cream)', fontSize:11, outline:'none', fontFamily:'var(--font-mono)' }}
            />
          </div>
        )}
      </div>

      {/* Actions — show on hover, only for Waypoint todos */}
      {!isCalendar && hovering && !todo.completed && (
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          <button onClick={() => setShowDatePicker(s => !s)} title="Set due date" style={{
            fontFamily:'var(--font-mono)', fontSize:10, padding:'2px 6px',
            background:'rgba(255,255,255,.05)', color:'var(--muted)',
            border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', cursor:'pointer',
          }}>📅</button>
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
  const [showUpcoming, setShowUpcoming] = useState(false)
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

  const updateDateMut = useMutation({
    mutationFn: ({ id, due_date }) => api.updateTodo(id, { due_date }),
    onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Due date updated', '📅') },
    onError: () => onToast('Failed to update date', '✖'),
  })

  function addTodo() {
    if (!newTask.trim()) return
    addMut.mutate({ task: newTask.trim(), due_date: newDate || null })
  }

  const today = new Date().toLocaleDateString('en-CA')
  const waypointTodos = todos.filter(t => t.source !== 'google_calendar')
  const calendarTodos = todos.filter(t => t.source === 'google_calendar')
  const open = waypointTodos.filter(t => !t.completed)

  // Three groups
  const overdue = open.filter(t => t.is_overdue)
  const todayGroup = [
    ...open.filter(t => !t.is_overdue && (!t.due_date || t.due_date.split('T')[0] <= today)),
    ...calendarTodos.filter(t => t.due_date && t.due_date.split('T')[0] === today),
  ]
  const upcoming = [
    ...open.filter(t => !t.is_overdue && t.due_date && t.due_date.split('T')[0] > today),
    ...calendarTodos.filter(t => t.due_date && t.due_date.split('T')[0] > today),
  ]
  const completed = waypointTodos.filter(t => t.completed).slice(0, 3)

  const totalOpen = overdue.length + todayGroup.length + upcoming.length

  const inp = { background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'var(--rs)', padding:'7px 10px', color:'var(--cream)', fontSize:12, outline:'none', fontFamily:'var(--font-body)' }

  const renderItems = (items) => items.map(t => (
    <TodoItem key={t.id} todo={t}
      onComplete={id=>completeMut.mutate(id)}
      onDelete={id=>deleteMut.mutate(id)}
      onSnooze={id=>snoozeMut.mutate(id)}
      onUpdateDate={(id, due_date) => updateDateMut.mutate({ id, due_date })}
    />
  ))

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .1s ease both' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Open Todos</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', letterSpacing:1 }}>{totalOpen} open</div>
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
        {/* Overdue */}
        {overdue.length > 0 && (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--danger)', padding:'12px 0 4px', display:'flex', alignItems:'center', gap:8 }}>
              <span>Overdue</span>
              <span style={{ background:'rgba(224,90,90,.15)', color:'var(--danger)', padding:'1px 7px', borderRadius:8, fontSize:9, fontWeight:600 }}>{overdue.length}</span>
            </div>
            {renderItems(overdue)}
          </>
        )}

        {/* Today */}
        {todayGroup.length > 0 && (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--gold-400)', padding:'12px 0 4px' }}>Today</div>
            {renderItems(todayGroup)}
          </>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <button onClick={()=>setShowUpcoming(s=>!s)} style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'12px 0 4px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, width:'100%' }}>
              <span>Upcoming</span>
              <span style={{ background:'rgba(255,255,255,.06)', padding:'1px 7px', borderRadius:8, fontSize:9, color:'var(--cream)' }}>{upcoming.length}</span>
              <span style={{ marginLeft:'auto', fontSize:9, transition:'transform var(--t)', transform: showUpcoming ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {showUpcoming && renderItems(upcoming)}
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'12px 0 4px', opacity:.5 }}>Recently Done</div>
            {completed.map(t => (
              <TodoItem key={t.id} todo={t} onComplete={()=>{}} onDelete={()=>{}} onSnooze={()=>{}} onUpdateDate={()=>{}} />
            ))}
          </>
        )}

        {totalOpen === 0 && completed.length === 0 && (
          <div style={{ textAlign:'center', padding:'28px 0', color:'var(--muted)' }}>
            <div style={{ fontSize:22, opacity:.3, marginBottom:8 }}>✓</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>All clear — add something above</div>
          </div>
        )}
      </div>
    </div>
  )
}

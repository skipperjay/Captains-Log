import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { fmtDate } from '../lib/constants'

const DAYS = ['S','M','T','W','T','F','S']
const TODAY_KEY = () => `skip_${new Date().toLocaleDateString('en-CA')}`
function getSkipped() { try { return JSON.parse(localStorage.getItem(TODAY_KEY()) || '[]') } catch { return [] } }
function setSkippedLS(ids) { localStorage.setItem(TODAY_KEY(), JSON.stringify(ids)) }
function daysUntil(dateStr) {
  const t = new Date(); t.setHours(0,0,0,0)
  return Math.ceil((new Date(dateStr+'T00:00:00') - t) / 86400000)
}
function scheduleLabel(h) {
  if (h.schedule_type === 'specific_days' && h.scheduled_days?.length) return h.scheduled_days.map(d => DAYS[d]).join(' ')
  if (h.schedule_type === 'weekly_target') return `${h.weekly_target || 7}x/week`
  return 'Daily'
}

// ── Habit Card ──────────────────────────────────────────────
function HabitCard({ habit, isSkipped, onLog, onSkip, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [scheduleType, setScheduleType] = useState(habit.schedule_type || 'daily')
  const [selectedDays, setSelectedDays] = useState(habit.scheduled_days || [])
  const [weeklyTarget, setWeeklyTarget] = useState(habit.weekly_target || 7)
  const [confirm, setConfirm] = useState(false)

  const isDone = habit.logged_today
  const isDue = habit.due_today !== false
  const isRest = !isDue && !isDone

  function saveSchedule() {
    onUpdate(habit.habit_name, {
      schedule_type: scheduleType,
      scheduled_days: scheduleType === 'specific_days' ? selectedDays : [],
      weekly_target: scheduleType === 'weekly_target' ? weeklyTarget : 7,
    })
    setEditing(false)
  }

  const borderColor = isDone ? 'rgba(46,200,128,.2)' : isSkipped ? 'rgba(255,255,255,.04)' : isDue ? 'rgba(201,160,48,.12)' : 'rgba(255,255,255,.04)'

  return (
    <div style={{
      background: 'var(--navy-900)', border: `1px solid ${borderColor}`,
      borderRadius: 'var(--r)', padding: '16px 18px', position: 'relative',
      opacity: isRest ? 0.4 : 1, transition: 'all var(--t)',
    }}>
      {/* Top row: name + actions */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color: isDone ? 'var(--success)' : 'var(--cream)', textTransform:'capitalize' }}>
            {habit.habit_name}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:3 }}>
            {scheduleLabel(habit)}
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => setEditing(e => !e)} title="Schedule settings" style={{ fontSize:12, background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:'2px 4px', opacity:.6 }}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='.6'}>⚙</button>
          {confirm ? (
            <button onClick={() => { onDelete(habit.habit_name); setConfirm(false) }} style={{ fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 6px', background:'rgba(224,90,90,.1)', color:'var(--danger)', border:'1px solid rgba(224,90,90,.2)', borderRadius:'var(--rs)', cursor:'pointer' }}>confirm</button>
          ) : (
            <button onClick={() => setConfirm(true)} title="Delete habit" style={{ fontSize:12, background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:'2px 4px', opacity:.4 }}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='.4'}>✕</button>
          )}
        </div>
      </div>

      {/* Streak */}
      {habit.streak > 0 && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--gold-400)', marginTop:8 }}>
          {habit.streak}d streak {habit.streak >= 3 ? '🔥' : ''}
        </div>
      )}

      {/* Status / Action area */}
      <div style={{ marginTop:12 }}>
        {isDone ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--success)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'white', fontSize:14, fontWeight:700 }}>✓</span>
            </div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--success)' }}>Logged today</span>
          </div>
        ) : isSkipped ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', opacity:.5 }}>
              <span style={{ color:'var(--navy-900)', fontSize:14, fontWeight:700 }}>✓</span>
            </div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>Skipped</span>
          </div>
        ) : isRest ? (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>Rest day</div>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => onLog({ habit_name: habit.habit_name })} style={{
              flex:1, padding:'10px', background:'rgba(201,160,48,.08)', border:'1px solid rgba(201,160,48,.2)',
              borderRadius:'var(--rs)', color:'var(--gold-400)', fontSize:12, fontWeight:600, cursor:'pointer',
              fontFamily:'var(--font-body)', transition:'all var(--t)',
            }} onMouseEnter={e=>e.currentTarget.style.background='rgba(201,160,48,.15)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(201,160,48,.08)'}>
              Log ✓
            </button>
            <button onClick={() => onSkip(habit.habit_name)} style={{
              padding:'10px 14px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)',
              borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer',
              fontFamily:'var(--font-mono)',
            }}>Skip</button>
          </div>
        )}
      </div>

      {/* Inline schedule editor */}
      {editing && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display:'flex', gap:4, marginBottom:12 }}>
            {[['daily','Daily'],['specific_days','Days'],['weekly_target','Target']].map(([val, label]) => (
              <button key={val} onClick={() => setScheduleType(val)} style={{
                flex:1, padding:'6px 4px', fontSize:9, fontFamily:'var(--font-mono)',
                background: scheduleType === val ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.03)',
                color: scheduleType === val ? 'var(--gold-400)' : 'var(--muted)',
                border: `1px solid ${scheduleType === val ? 'rgba(201,160,48,.3)' : 'rgba(255,255,255,.06)'}`,
                borderRadius:'var(--rs)', cursor:'pointer',
              }}>{label}</button>
            ))}
          </div>
          {scheduleType === 'specific_days' && (
            <div style={{ display:'flex', gap:4, marginBottom:12, justifyContent:'center' }}>
              {DAYS.map((d, i) => (
                <button key={i} onClick={() => setSelectedDays(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])} style={{
                  width:28, height:28, borderRadius:'50%', fontSize:10, fontWeight:600, fontFamily:'var(--font-mono)',
                  background: selectedDays.includes(i) ? 'rgba(201,160,48,.2)' : 'rgba(255,255,255,.03)',
                  color: selectedDays.includes(i) ? 'var(--gold-400)' : 'var(--muted)',
                  border: `1px solid ${selectedDays.includes(i) ? 'rgba(201,160,48,.4)' : 'rgba(255,255,255,.06)'}`,
                  cursor:'pointer',
                }}>{d}</button>
              ))}
            </div>
          )}
          {scheduleType === 'weekly_target' && (
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, justifyContent:'center' }}>
              <button onClick={() => setWeeklyTarget(Math.max(1, weeklyTarget-1))} style={{ width:24, height:24, borderRadius:'50%', fontSize:13, fontWeight:700, background:'rgba(255,255,255,.04)', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer' }}>-</button>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color:'var(--gold-400)' }}>{weeklyTarget}</span>
              <button onClick={() => setWeeklyTarget(Math.min(7, weeklyTarget+1))} style={{ width:24, height:24, borderRadius:'50%', fontSize:13, fontWeight:700, background:'rgba(255,255,255,.04)', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer' }}>+</button>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>/ week</span>
            </div>
          )}
          <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={() => setEditing(false)} style={{ padding:'5px 10px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:10, cursor:'pointer' }}>Cancel</button>
            <button onClick={saveSchedule} style={{ padding:'5px 12px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:10, fontWeight:600, cursor:'pointer' }}>Save</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Todo Row ────────────────────────────────────────────────
function TodoRow({ todo, onComplete, onDelete, onUpdateDate, onUpdatePriority }) {
  const [hovering, setHovering] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const days = todo.due_date ? daysUntil(todo.due_date) : null

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}
    >
      {/* Drag handle */}
      <span style={{ color:'var(--muted)', fontSize:12, cursor:'grab', flexShrink:0, marginTop:3, opacity:.4, userSelect:'none' }}>⠿</span>

      {/* Checkbox */}
      <button onClick={() => onComplete(todo.id)} style={{
        width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:1,
        border: `2px solid ${todo.completed ? 'var(--success)' : todo.is_overdue ? 'var(--danger)' : 'rgba(255,255,255,.15)'}`,
        background: todo.completed ? 'var(--success)' : 'transparent',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t)',
      }}>
        {todo.completed && <span style={{ color:'var(--navy-900)', fontSize:10, fontWeight:700 }}>✓</span>}
      </button>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:12, fontWeight:500, lineHeight:1.4, wordBreak:'break-word',
          color: todo.completed ? 'var(--muted)' : todo.is_overdue ? 'var(--danger)' : 'var(--cream)',
          textDecoration: todo.completed ? 'line-through' : 'none',
        }}>{todo.task}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, marginTop:2, color: todo.is_overdue ? 'var(--danger)' : 'var(--muted)', display:'flex', alignItems:'center', gap:5 }}>
          {todo.is_overdue && '⚠ Overdue · '}
          {todo.due_date ? fmtDate(todo.due_date) : ''}
          {days !== null && days > 0 && !todo.is_overdue && <span style={{ color:'var(--muted)' }}> · in {days}d</span>}
        </div>
        {showDate && (
          <input type="date" defaultValue={todo.due_date || ''} autoFocus
            onChange={e => { onUpdateDate(todo.id, e.target.value || null); setShowDate(false) }}
            onBlur={() => setTimeout(() => setShowDate(false), 200)}
            style={{ marginTop:4, background:'var(--navy-800)', border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--rs)', padding:'4px 8px', color:'var(--cream)', fontSize:11, outline:'none', fontFamily:'var(--font-mono)' }}
          />
        )}
      </div>

      {/* Actions */}
      {hovering && !todo.completed && (
        <div style={{ display:'flex', gap:3, flexShrink:0 }}>
          <button onClick={() => setShowDate(s=>!s)} title="Set due date" style={{ fontSize:10, padding:'2px 5px', background:'rgba(255,255,255,.05)', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', cursor:'pointer', fontFamily:'var(--font-mono)' }}>📅</button>
          <button onClick={() => onDelete(todo.id)} title="Delete" style={{ fontSize:9, padding:'2px 6px', background:'rgba(224,90,90,.08)', color:'var(--danger)', border:'1px solid rgba(224,90,90,.15)', borderRadius:'var(--rs)', cursor:'pointer', fontFamily:'var(--font-mono)' }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function HabitsTodos({ habits=[], todos=[], onToast }) {
  const qc = useQueryClient()
  const [skipped, setSkippedState] = useState(getSkipped)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newScheduleType, setNewScheduleType] = useState('daily')
  const [newDays, setNewDays] = useState([])
  const [newTarget, setNewTarget] = useState(7)
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newDate, setNewDate] = useState('')

  // Mutations
  const logMut = useMutation({ mutationFn: api.logHabit, onSuccess: () => { qc.invalidateQueries(['habitsToday']); onToast('Habit logged ✓', '🔥') } })
  const createHabitMut = useMutation({ mutationFn: api.createHabit, onSuccess: () => { qc.invalidateQueries(['habitsToday']); setShowAddHabit(false); setNewHabitName(''); onToast('Habit created', '✓') } })
  const updateHabitMut = useMutation({ mutationFn: ({ id, body }) => api.updateHabit(id, body), onSuccess: () => { qc.invalidateQueries(['habitsToday']); onToast('Schedule updated', '⚙') } })
  const deleteHabitMut = useMutation({ mutationFn: api.deleteHabit, onSuccess: () => { qc.invalidateQueries(['habitsToday']); onToast('Habit removed', '✕') } })
  const completeMut = useMutation({ mutationFn: api.completeTodo, onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Task complete ✓', '✓') } })
  const addTodoMut = useMutation({ mutationFn: api.addWaypointTodo, onSuccess: () => { qc.invalidateQueries(['todos']); setNewTask(''); setNewDate(''); onToast('Todo added', '✦') } })
  const deleteTodoMut = useMutation({ mutationFn: api.deleteTodo, onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Removed', '✕') } })
  const updateTodoMut = useMutation({ mutationFn: ({ id, body }) => api.updateTodo(id, body), onSuccess: () => { qc.invalidateQueries(['todos']); onToast('Updated', '📅') } })

  function skipHabit(name) {
    const next = [...skipped, name]
    setSkippedState(next); setSkippedLS(next)
  }

  function addHabit() {
    if (!newHabitName.trim()) return
    createHabitMut.mutate({
      habit_name: newHabitName.trim().toLowerCase(),
      schedule_type: newScheduleType,
      scheduled_days: newScheduleType === 'specific_days' ? newDays : [],
      weekly_target: newScheduleType === 'weekly_target' ? newTarget : 7,
    })
  }

  function addTodo() {
    if (!newTask.trim()) return
    addTodoMut.mutate({ task: newTask.trim(), due_date: newDate || null })
  }

  // Todo groups
  const today = new Date().toLocaleDateString('en-CA')
  const openTodos = todos.filter(t => !t.completed)
  const overdue = openTodos.filter(t => t.is_overdue)
  const todayGroup = openTodos.filter(t => !t.is_overdue && (!t.due_date || t.due_date.split('T')[0] <= today))
  const upcoming = openTodos.filter(t => !t.is_overdue && t.due_date && t.due_date.split('T')[0] > today)
  const completed = todos.filter(t => t.completed).slice(0, 5)

  const inp = { background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'var(--rs)', padding:'8px 12px', color:'var(--cream)', fontSize:12, outline:'none', fontFamily:'var(--font-body)' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* ══ HABITS ══ */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:20, fontWeight:800, color:'var(--cream)' }}>Habits</div>
          <button onClick={() => setShowAddHabit(s=>!s)} style={{
            fontFamily:'var(--font-mono)', fontSize:9, padding:'5px 14px',
            background: showAddHabit ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.05)',
            color: showAddHabit ? 'var(--gold-400)' : 'var(--muted)',
            border: `1px solid ${showAddHabit ? 'rgba(201,160,48,.25)' : 'rgba(255,255,255,.08)'}`,
            borderRadius:'var(--rs)', cursor:'pointer',
          }}>+ Add Habit</button>
        </div>

        {/* Add habit form */}
        {showAddHabit && (
          <div style={{ background:'var(--navy-900)', border:'1px solid rgba(201,160,48,.15)', borderRadius:'var(--r)', padding:'16px 18px', marginBottom:14 }}>
            <input value={newHabitName} onChange={e=>setNewHabitName(e.target.value)} placeholder="Habit name (e.g. journal)" onKeyDown={e=>e.key==='Enter'&&addHabit()} autoFocus style={{ ...inp, width:'100%', marginBottom:12 }} />
            <div style={{ display:'flex', gap:4, marginBottom:12 }}>
              {[['daily','Daily'],['specific_days','Specific Days'],['weekly_target','Weekly Target']].map(([val, label]) => (
                <button key={val} onClick={() => setNewScheduleType(val)} style={{
                  flex:1, padding:'6px 4px', fontSize:9, fontFamily:'var(--font-mono)',
                  background: newScheduleType === val ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.03)',
                  color: newScheduleType === val ? 'var(--gold-400)' : 'var(--muted)',
                  border: `1px solid ${newScheduleType === val ? 'rgba(201,160,48,.3)' : 'rgba(255,255,255,.06)'}`,
                  borderRadius:'var(--rs)', cursor:'pointer',
                }}>{label}</button>
              ))}
            </div>
            {newScheduleType === 'specific_days' && (
              <div style={{ display:'flex', gap:5, marginBottom:12, justifyContent:'center' }}>
                {DAYS.map((d, i) => (
                  <button key={i} onClick={() => setNewDays(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])} style={{
                    width:30, height:30, borderRadius:'50%', fontSize:10, fontWeight:600, fontFamily:'var(--font-mono)',
                    background: newDays.includes(i) ? 'rgba(201,160,48,.2)' : 'rgba(255,255,255,.03)',
                    color: newDays.includes(i) ? 'var(--gold-400)' : 'var(--muted)',
                    border: `1px solid ${newDays.includes(i) ? 'rgba(201,160,48,.4)' : 'rgba(255,255,255,.06)'}`,
                    cursor:'pointer',
                  }}>{d}</button>
                ))}
              </div>
            )}
            {newScheduleType === 'weekly_target' && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, justifyContent:'center' }}>
                <button onClick={() => setNewTarget(Math.max(1, newTarget-1))} style={{ width:26, height:26, borderRadius:'50%', fontSize:13, fontWeight:700, background:'rgba(255,255,255,.04)', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer' }}>-</button>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700, color:'var(--gold-400)' }}>{newTarget}</span>
                <button onClick={() => setNewTarget(Math.min(7, newTarget+1))} style={{ width:26, height:26, borderRadius:'50%', fontSize:13, fontWeight:700, background:'rgba(255,255,255,.04)', color:'var(--muted)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer' }}>+</button>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>days / week</span>
              </div>
            )}
            <button onClick={addHabit} disabled={!newHabitName.trim() || createHabitMut.isPending} style={{
              width:'100%', padding:'9px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)',
              color:'var(--navy-900)', fontSize:12, fontWeight:600, cursor:'pointer',
            }}>Create Habit</button>
          </div>
        )}

        {/* Habit grid */}
        {habits.length === 0 ? (
          <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'32px', textAlign:'center', color:'var(--muted)' }}>
            <div style={{ fontSize:22, opacity:.2, marginBottom:8 }}>🧭</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>No habits yet — add one above or log via WhatsApp</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12 }}>
            {habits.map((h, i) => (
              <HabitCard key={i} habit={h}
                isSkipped={skipped.includes(h.habit_name)}
                onLog={data => logMut.mutate(data)}
                onSkip={skipHabit}
                onDelete={name => deleteHabitMut.mutate(name)}
                onUpdate={(id, body) => updateHabitMut.mutate({ id, body })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ TODOS ══ */}
      <div>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:20, fontWeight:800, color:'var(--cream)', marginBottom:14 }}>Todos</div>

        {/* Add todo bar */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTodo()} placeholder="What needs to be done?" style={{ ...inp, flex:1, minWidth:0 }} />
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{ ...inp, width:140 }} />
          <button onClick={addTodo} disabled={!newTask.trim() || addTodoMut.isPending} style={{
            padding:'8px 16px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)',
            color:'var(--navy-900)', fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0,
          }}>Add</button>
        </div>

        <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'4px 18px 14px' }}>
          {/* Overdue */}
          {overdue.length > 0 && (
            <>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--danger)', padding:'14px 0 4px', display:'flex', alignItems:'center', gap:8 }}>
                <span>Overdue</span>
                <span style={{ background:'rgba(224,90,90,.15)', color:'var(--danger)', padding:'1px 7px', borderRadius:8, fontSize:9, fontWeight:600 }}>{overdue.length}</span>
              </div>
              {overdue.map(t => <TodoRow key={t.id} todo={t} onComplete={id=>completeMut.mutate(id)} onDelete={id=>deleteTodoMut.mutate(id)} onUpdateDate={(id, d) => updateTodoMut.mutate({ id, body:{ due_date: d } })} />)}
            </>
          )}

          {/* Today */}
          {todayGroup.length > 0 && (
            <>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--gold-400)', padding:'14px 0 4px' }}>Today</div>
              {todayGroup.map(t => <TodoRow key={t.id} todo={t} onComplete={id=>completeMut.mutate(id)} onDelete={id=>deleteTodoMut.mutate(id)} onUpdateDate={(id, d) => updateTodoMut.mutate({ id, body:{ due_date: d } })} />)}
            </>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <>
              <button onClick={() => setShowUpcoming(s=>!s)} style={{
                fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)',
                padding:'14px 0 4px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, width:'100%',
              }}>
                <span>Upcoming</span>
                <span style={{ background:'rgba(255,255,255,.06)', padding:'1px 7px', borderRadius:8, fontSize:9, color:'var(--cream)' }}>{upcoming.length}</span>
                <span style={{ marginLeft:'auto', fontSize:9, transition:'transform var(--t)', transform: showUpcoming ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>
              {showUpcoming && upcoming.map(t => <TodoRow key={t.id} todo={t} onComplete={id=>completeMut.mutate(id)} onDelete={id=>deleteTodoMut.mutate(id)} onUpdateDate={(id, d) => updateTodoMut.mutate({ id, body:{ due_date: d } })} />)}
            </>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', padding:'14px 0 4px', opacity:.5 }}>Recently Done</div>
              {completed.map(t => <TodoRow key={t.id} todo={t} onComplete={()=>{}} onDelete={()=>{}} onUpdateDate={()=>{}} />)}
            </>
          )}

          {openTodos.length === 0 && completed.length === 0 && (
            <div style={{ textAlign:'center', padding:'28px 0', color:'var(--muted)' }}>
              <div style={{ fontSize:22, opacity:.3, marginBottom:8 }}>✓</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>All clear — add something above</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

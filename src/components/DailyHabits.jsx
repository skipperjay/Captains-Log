import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const HABIT_MESSAGES = {
  meditate:       'Clear mind. Better decisions.',
  exercise:       'Your body is the foundation.',
  read:           'Sharpen the saw daily.',
  pray:           'Ground yourself.',
  protein:        'Fuel the machine.',
  'project work': 'Move the needle today.',
}

const DAYS = ['S','M','T','W','T','F','S']
const TODAY_KEY = () => `skip_${new Date().toLocaleDateString('en-CA')}`

function getSkipped() {
  try { return JSON.parse(localStorage.getItem(TODAY_KEY()) || '[]') } catch { return [] }
}
function setSkipped(ids) {
  localStorage.setItem(TODAY_KEY(), JSON.stringify(ids))
}

function HabitSettingsModal({ habit, onClose, onSave }) {
  const [scheduleType, setScheduleType] = useState(habit.schedule_type || 'daily')
  const [selectedDays, setSelectedDays] = useState(habit.scheduled_days || [])
  const [weeklyTarget, setWeeklyTarget] = useState(habit.weekly_target || 7)
  const [saving, setSaving] = useState(false)

  function toggleDay(d) {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  async function save() {
    setSaving(true)
    await onSave(habit.id || habit.habit_name, {
      schedule_type: scheduleType,
      scheduled_days: scheduleType === 'specific_days' ? selectedDays : [],
      weekly_target: scheduleType === 'weekly_target' ? weeklyTarget : 7,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--navy-800)', border:'1px solid rgba(201,160,48,.2)', borderRadius:'var(--r)', padding:'20px 24px', width:320, maxWidth:'90vw' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)', marginBottom:4 }}>
          {habit.habit_name}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:16 }}>Schedule Settings</div>

        {/* Schedule type buttons */}
        <div style={{ display:'flex', gap:6, marginBottom:16 }}>
          {[['daily','Daily'],['specific_days','Specific Days'],['weekly_target','Weekly Target']].map(([val, label]) => (
            <button key={val} onClick={() => setScheduleType(val)} style={{
              flex:1, padding:'7px 4px', fontSize:10, fontFamily:'var(--font-mono)',
              background: scheduleType === val ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.04)',
              color: scheduleType === val ? 'var(--gold-400)' : 'var(--muted)',
              border: `1px solid ${scheduleType === val ? 'rgba(201,160,48,.3)' : 'rgba(255,255,255,.08)'}`,
              borderRadius:'var(--rs)', cursor:'pointer', transition:'all var(--t)',
            }}>{label}</button>
          ))}
        </div>

        {/* Specific days selector */}
        {scheduleType === 'specific_days' && (
          <div style={{ display:'flex', gap:6, marginBottom:16, justifyContent:'center' }}>
            {DAYS.map((d, i) => (
              <button key={i} onClick={() => toggleDay(i)} style={{
                width:32, height:32, borderRadius:'50%', fontSize:11, fontWeight:600,
                fontFamily:'var(--font-mono)',
                background: selectedDays.includes(i) ? 'rgba(201,160,48,.2)' : 'rgba(255,255,255,.04)',
                color: selectedDays.includes(i) ? 'var(--gold-400)' : 'var(--muted)',
                border: `1px solid ${selectedDays.includes(i) ? 'rgba(201,160,48,.4)' : 'rgba(255,255,255,.08)'}`,
                cursor:'pointer', transition:'all var(--t)',
              }}>{d}</button>
            ))}
          </div>
        )}

        {/* Weekly target stepper */}
        {scheduleType === 'weekly_target' && (
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, justifyContent:'center' }}>
            <button onClick={() => setWeeklyTarget(Math.max(1, weeklyTarget - 1))} style={{
              width:28, height:28, borderRadius:'50%', fontSize:14, fontWeight:700,
              background:'rgba(255,255,255,.04)', color:'var(--muted)',
              border:'1px solid rgba(255,255,255,.08)', cursor:'pointer',
            }}>-</button>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700, color:'var(--gold-400)', minWidth:24, textAlign:'center' }}>
              {weeklyTarget}
            </div>
            <button onClick={() => setWeeklyTarget(Math.min(7, weeklyTarget + 1))} style={{
              width:28, height:28, borderRadius:'50%', fontSize:14, fontWeight:700,
              background:'rgba(255,255,255,.04)', color:'var(--muted)',
              border:'1px solid rgba(255,255,255,.08)', cursor:'pointer',
            }}>+</button>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>days / week</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'6px 14px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding:'6px 16px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer', opacity: saving ? .5 : 1 }}>Save</button>
        </div>
      </div>
    </div>
  )
}

function HabitRow({ habit, onLog, onSkip, isSkipped, onOpenSettings }) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  function submit() {
    onLog({ habit_name: habit.habit_name, duration_mins: duration ? parseInt(duration) : null, notes: notes || null })
    setOpen(false)
    setDuration('')
    setNotes('')
  }

  const isDone = habit.logged_today
  const isDue = habit.due_today !== false
  const isRest = !isDue && !isDone

  const color = isDone ? 'var(--success)' : isSkipped ? 'var(--muted)' : 'var(--gold-400)'
  const bg    = isDone ? 'rgba(46,200,128,.04)' : isSkipped ? 'rgba(255,255,255,.02)' : 'rgba(201,160,48,.05)'
  const border= isDone ? 'rgba(46,200,128,.1)'  : isSkipped ? 'rgba(255,255,255,.04)' : 'rgba(201,160,48,.12)'

  return (
    <div style={{ marginBottom: 6, borderRadius: 'var(--rs)', overflow:'hidden', border:`1px solid ${open ? 'rgba(201,160,48,.25)' : border}`, transition:'border-color var(--t)', opacity: isRest ? 0.4 : 1 }}>
      {/* Main row */}
      <div
        onClick={() => !isDone && !isSkipped && !isRest && setOpen(o=>!o)}
        style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 14px',
          background: open ? 'rgba(201,160,48,.08)' : bg,
          cursor: isDone || isSkipped || isRest ? 'default' : 'pointer',
          transition:'background var(--t)',
        }}
      >
        {/* Status dot */}
        <div style={{
          width:10, height:10, borderRadius:'50%', flexShrink:0,
          background: isDone ? 'var(--success)' : isSkipped ? 'var(--muted)' : 'transparent',
          border: `2px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--muted)' : isRest ? 'rgba(255,255,255,.1)' : 'rgba(201,160,48,.4)'}`,
          boxShadow: isDone ? '0 0 8px rgba(46,200,128,.4)' : 'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all var(--t)',
        }}>
          {(isDone || isSkipped) && <span style={{ color: isDone ? 'white' : 'var(--navy-900)', fontSize:7, fontWeight:700 }}>✓</span>}
        </div>

        {/* Label */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:500, color: isDone || isRest ? 'var(--muted)' : isSkipped ? 'var(--muted)' : 'var(--cream)', textTransform:'capitalize', textDecoration: isDone ? 'line-through' : 'none' }}>
            {habit.habit_name}
          </div>
          {isRest ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:1 }}>rest day</div>
          ) : isSkipped ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:1 }}>skipped</div>
          ) : !isDone ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:1 }}>
              {HABIT_MESSAGES[habit.habit_name.toLowerCase()] || 'Tap to log'}
            </div>
          ) : null}
        </div>

        {/* Streak */}
        {habit.streak > 0 && (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: isDone ? 'var(--success)' : 'var(--gold-400)', flexShrink:0 }}>
            {habit.streak}d {habit.streak >= 3 ? '🔥' : ''}
          </div>
        )}

        {/* Skip button */}
        {isDue && !isDone && !isSkipped && !open && (
          <button onClick={e => { e.stopPropagation(); onSkip(habit.habit_name) }} title="Skip today" style={{
            fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 6px',
            background:'rgba(255,255,255,.04)', color:'var(--muted)',
            border:'1px solid rgba(255,255,255,.06)', borderRadius:'var(--rs)', cursor:'pointer',
            flexShrink:0,
          }}>skip</button>
        )}

        {/* Settings gear */}
        {!open && (
          <button onClick={e => { e.stopPropagation(); onOpenSettings(habit) }} title="Schedule settings" style={{
            fontSize:12, padding:0, background:'none', border:'none',
            color:'var(--muted)', cursor:'pointer', flexShrink:0, opacity:.5,
            transition:'opacity var(--t)',
          }} onMouseEnter={e => e.currentTarget.style.opacity='1'} onMouseLeave={e => e.currentTarget.style.opacity='.5'}>⚙</button>
        )}

        {/* Arrow */}
        {isDue && !isDone && !isSkipped && (
          <div style={{ color:'var(--muted)', fontSize:11, flexShrink:0, transition:'transform var(--t)', transform: open ? 'rotate(180deg)' : 'none' }}>▾</div>
        )}
      </div>

      {/* Expanded log form */}
      {open && !isDone && !isSkipped && (
        <div style={{ padding:'12px 14px', background:'rgba(201,160,48,.04)', borderTop:'1px solid rgba(201,160,48,.1)' }}>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:4 }}>Duration (mins)</label>
              <input
                type="number" value={duration} onChange={e=>setDuration(e.target.value)}
                placeholder="20" min="1" max="300"
                style={{ width:'100%', background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', padding:'6px 10px', color:'var(--cream)', fontSize:12, outline:'none', fontFamily:'var(--font-body)' }}
                autoFocus
              />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:4 }}>Notes (optional)</label>
            <input
              value={notes} onChange={e=>setNotes(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              placeholder="How did it go?"
              style={{ width:'100%', background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', padding:'6px 10px', color:'var(--cream)', fontSize:12, outline:'none', fontFamily:'var(--font-body)' }}
            />
          </div>
          <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={()=>setOpen(false)} style={{ padding:'5px 12px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} style={{ padding:'5px 14px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
              Log {habit.habit_name} ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DailyHabits({ habits=[], onToast }) {
  const qc = useQueryClient()
  const [skipped, setSkippedState] = useState(getSkipped)
  const [settingsHabit, setSettingsHabit] = useState(null)

  const dueHabits = habits.filter(h => h.due_today !== false)
  const total = dueHabits.length
  const done  = dueHabits.filter(h => h.logged_today).length

  const logMut = useMutation({
    mutationFn: api.logHabit,
    onSuccess: () => { qc.invalidateQueries(['habitsToday']); onToast('Habit logged ✓', '🔥') },
    onError: () => onToast('Failed to log habit', '✖'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, body }) => api.updateHabit(id, body),
    onSuccess: () => { qc.invalidateQueries(['habitsToday']); onToast('Schedule updated', '⚙') },
    onError: () => onToast('Failed to update schedule', '✖'),
  })

  function skipHabit(name) {
    const next = [...skipped, name]
    setSkippedState(next)
    setSkipped(next)
  }

  if (habits.length === 0) return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'28px 18px', textAlign:'center', color:'var(--muted)' }}>
      <div style={{ fontSize:22, opacity:.2, marginBottom:8 }}>🧭</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>Log habits via WhatsApp to see them here</div>
    </div>
  )

  return (
    <>
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .1s ease both' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Today's Habits</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: done===total && total > 0 ? 'var(--success)' : 'var(--muted)', letterSpacing:1 }}>
            {done}/{total} {done===total && total > 0 ? '✓ Complete' : 'due'}
          </div>
        </div>
        <div style={{ padding:'10px 12px 12px' }}>
          {habits.map((h,i) => (
            <HabitRow
              key={i}
              habit={h}
              onLog={data => logMut.mutate(data)}
              onSkip={skipHabit}
              isSkipped={skipped.includes(h.habit_name)}
              onOpenSettings={setSettingsHabit}
            />
          ))}
        </div>
      </div>
      {settingsHabit && (
        <HabitSettingsModal
          habit={settingsHabit}
          onClose={() => setSettingsHabit(null)}
          onSave={(id, body) => updateMut.mutateAsync({ id, body })}
        />
      )}
    </>
  )
}

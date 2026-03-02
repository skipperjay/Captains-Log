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

function HabitRow({ habit, onLog }) {
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
  const color = isDone ? 'var(--success)' : 'var(--gold-400)'
  const bg    = isDone ? 'rgba(46,200,128,.04)' : 'rgba(201,160,48,.05)'
  const border= isDone ? 'rgba(46,200,128,.1)'  : 'rgba(201,160,48,.12)'

  return (
    <div style={{ marginBottom: 6, borderRadius: 'var(--rs)', overflow:'hidden', border:`1px solid ${open ? 'rgba(201,160,48,.25)' : border}`, transition:'border-color var(--t)' }}>
      {/* Main row */}
      <div
        onClick={() => !isDone && setOpen(o=>!o)}
        style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 14px',
          background: open ? 'rgba(201,160,48,.08)' : bg,
          cursor: isDone ? 'default' : 'pointer',
          transition:'background var(--t)',
        }}
      >
        {/* Status dot */}
        <div style={{
          width:10, height:10, borderRadius:'50%', flexShrink:0,
          background: isDone ? 'var(--success)' : 'transparent',
          border: `2px solid ${isDone ? 'var(--success)' : 'rgba(201,160,48,.4)'}`,
          boxShadow: isDone ? '0 0 8px rgba(46,200,128,.4)' : 'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all var(--t)',
        }}>
          {isDone && <span style={{ color:'white', fontSize:7, fontWeight:700 }}>✓</span>}
        </div>

        {/* Label */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:500, color: isDone ? 'var(--muted)' : 'var(--cream)', textTransform:'capitalize', textDecoration: isDone ? 'line-through' : 'none' }}>
            {habit.habit_name}
          </div>
          {!isDone && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:1 }}>
              {HABIT_MESSAGES[habit.habit_name.toLowerCase()] || 'Tap to log'}
            </div>
          )}
        </div>

        {/* Streak */}
        {habit.streak > 0 && (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: isDone ? 'var(--success)' : 'var(--gold-400)', flexShrink:0 }}>
            {habit.streak}d {habit.streak >= 3 ? '🔥' : ''}
          </div>
        )}

        {/* Arrow */}
        {!isDone && (
          <div style={{ color:'var(--muted)', fontSize:11, flexShrink:0, transition:'transform var(--t)', transform: open ? 'rotate(180deg)' : 'none' }}>▾</div>
        )}
      </div>

      {/* Expanded log form */}
      {open && !isDone && (
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
  const total = habits.length
  const done  = habits.filter(h=>h.logged_today).length

  const logMut = useMutation({
    mutationFn: api.logHabit,
    onSuccess: () => { qc.invalidateQueries(['habitsToday']); onToast('Habit logged ✓', '🔥') },
    onError: () => onToast('Failed to log habit', '✖'),
  })

  if (total === 0) return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'28px 18px', textAlign:'center', color:'var(--muted)' }}>
      <div style={{ fontSize:22, opacity:.2, marginBottom:8 }}>🧭</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10 }}>Log habits via WhatsApp to see them here</div>
    </div>
  )

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .1s ease both' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Today's Habits</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: done===total ? 'var(--success)' : 'var(--muted)', letterSpacing:1 }}>
          {done}/{total} {done===total ? '✓ Complete' : 'done'}
        </div>
      </div>
      <div style={{ padding:'10px 12px 12px' }}>
        {habits.map((h,i) => (
          <HabitRow key={i} habit={h} onLog={data => logMut.mutate(data)}/>
        ))}
      </div>
    </div>
  )
}

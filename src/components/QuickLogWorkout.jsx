import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const MUSCLES = ['chest','back','shoulders','biceps','triceps','legs','core','glutes','cardio']

const inp = {
  background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)',
  borderRadius:'var(--rs)', padding:'8px 10px', color:'var(--cream)',
  fontSize:12, outline:'none', fontFamily:'var(--font-body)', width:'100%',
  transition:'border-color var(--t)',
}

export default function QuickLogWorkout({ onToast }) {
  const [open, setOpen] = useState(false)
  const [exercise, setExercise] = useState('')
  const [muscle, setMuscle] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [lastLogged, setLastLogged] = useState(null)
  const qc = useQueryClient()

  const mut = useMutation({
    mutationFn: api.logWorkoutSet,
    onSuccess: (data) => {
      setLastLogged({ exercise, weight, reps, set_number: data.set_number })
      setReps('')
      qc.invalidateQueries(['workouts'])
      qc.invalidateQueries(['workout-records'])
      onToast(`Set ${data.set_number} logged`, '💪')
    },
    onError: () => onToast('Failed to log set', '✖'),
  })

  function submit() {
    if (!exercise.trim()) { onToast('Exercise name required', '⚠'); return }
    mut.mutate({
      exercise: exercise.trim(),
      muscle_group: muscle || null,
      weight_lbs: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps) : null,
    })
  }

  function endSession() {
    setOpen(false)
    setExercise(''); setMuscle(''); setWeight(''); setReps(''); setLastLogged(null)
    onToast('Workout session saved', '⚓')
  }

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .3s ease both' }}>
      <div
        onClick={() => setOpen(o=>!o)}
        style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'background var(--t)' }}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:16 }}>💪</span>
          <div>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Log Workout Set</div>
            {lastLogged && (
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--success)', marginTop:2 }}>
                Last: {lastLogged.exercise} · {lastLogged.weight}lbs · {lastLogged.reps} reps (Set {lastLogged.set_number})
              </div>
            )}
          </div>
        </div>
        <div style={{ color:'var(--muted)', fontSize:11, transition:'transform var(--t)', transform: open ? 'rotate(180deg)' : 'none' }}>▾</div>
      </div>

      {open && (
        <div style={{ padding:'0 18px 18px', borderTop:'1px solid rgba(255,255,255,.04)' }}>
          <div style={{ paddingTop:14, display:'flex', flexDirection:'column', gap:10 }}>

            {/* Exercise + Muscle */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div>
                <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:4 }}>Exercise *</label>
                <input
                  value={exercise} onChange={e=>setExercise(e.target.value)}
                  placeholder="Bench press"
                  style={inp} autoFocus
                  onFocus={e=>e.target.style.borderColor='rgba(201,160,48,.3)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.07)'}
                />
              </div>
              <div>
                <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:4 }}>Muscle Group</label>
                <select value={muscle} onChange={e=>setMuscle(e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  <option value="">Select...</option>
                  {MUSCLES.map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Weight + Reps */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div>
                <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:4 }}>Weight (lbs)</label>
                <input
                  type="number" value={weight} onChange={e=>setWeight(e.target.value)}
                  placeholder="185" min="0" max="1000"
                  style={inp}
                  onFocus={e=>e.target.style.borderColor='rgba(201,160,48,.3)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.07)'}
                />
              </div>
              <div>
                <label style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:4 }}>Reps</label>
                <input
                  type="number" value={reps} onChange={e=>setReps(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&submit()}
                  placeholder="8" min="1" max="100"
                  style={inp}
                  onFocus={e=>e.target.style.borderColor='rgba(201,160,48,.3)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.07)'}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:8, justifyContent:'space-between', alignItems:'center', paddingTop:2 }}>
              {lastLogged ? (
                <button onClick={endSession} style={{ fontFamily:'var(--font-mono)', fontSize:9, padding:'5px 12px', background:'rgba(46,200,128,.08)', color:'var(--success)', border:'1px solid rgba(46,200,128,.2)', borderRadius:'var(--rs)', cursor:'pointer' }}>
                  ⚓ Done — End Session
                </button>
              ) : <div/>}
              <button onClick={submit} disabled={!exercise.trim()||mut.isPending} style={{
                padding:'7px 18px', background:'var(--gold-400)', color:'var(--navy-900)',
                border:'none', borderRadius:'var(--rs)', fontSize:12, fontWeight:600, cursor:'pointer',
                opacity: !exercise.trim() ? .5 : 1,
              }}>
                {mut.isPending ? 'Logging...' : 'Log Set →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

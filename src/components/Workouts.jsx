import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../lib/api'
import { fmtDate } from '../lib/constants'
import WorkoutInsight from './WorkoutInsight'

const MONO = { fontFamily:'DM Mono,monospace', fontSize:9 }
const TT = { background:'#091525', border:'1px solid rgba(201,160,48,.2)', borderRadius:6, fontFamily:'DM Mono,monospace', fontSize:11, color:'#f0ead8' }

const MUSCLE_COLORS = {
  chest:     '#e8b84b',
  back:      '#63b3ed',
  shoulders: '#b794f4',
  biceps:    '#2ec880',
  triceps:   '#2ec880',
  legs:      '#f6ad55',
  core:      '#fc8181',
  glutes:    '#f6ad55',
  cardio:    '#76e4f7',
}

function getMuscleColor(muscle) {
  return MUSCLE_COLORS[(muscle||'').toLowerCase()] || 'var(--muted)'
}

function PRCard({ record, isNew }) {
  const color = getMuscleColor(record.muscle_group)
  return (
    <div style={{
      background:'var(--navy-800)',
      border:`1px solid ${isNew ? 'rgba(201,160,48,.3)' : 'rgba(255,255,255,.05)'}`,
      borderRadius:'var(--r)', padding:'14px 16px',
      position:'relative', overflow:'hidden',
      transition:'border-color var(--t)',
    }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=color+'44'}
      onMouseLeave={e=>e.currentTarget.style.borderColor=isNew?'rgba(201,160,48,.3)':'rgba(255,255,255,.05)'}
    >
      {isNew && (
        <div style={{ position:'absolute', top:8, right:8, fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:1, color:'var(--gold-400)', background:'rgba(201,160,48,.1)', padding:'2px 6px', borderRadius:8 }}>PR</div>
      )}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1, color: getMuscleColor(record.muscle_group), textTransform:'uppercase', marginBottom:6 }}>
        {record.muscle_group || 'General'}
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:'var(--cream)', marginBottom:8, lineHeight:1.3 }}>
        {record.exercise.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginBottom:2 }}>MAX WEIGHT</div>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:22, fontWeight:700, color, lineHeight:1 }}>
            {record.max_weight ? `${record.max_weight}` : '—'}
            {record.max_weight && <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', marginLeft:3 }}>lbs</span>}
          </div>
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginBottom:2 }}>MAX REPS</div>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:22, fontWeight:700, color:'var(--cream)', lineHeight:1 }}>
            {record.max_reps || '—'}
          </div>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginBottom:2 }}>SESSIONS</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--muted)', lineHeight:1 }}>
            {record.total_sessions}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressChart({ exercise, onBack }) {
  const { data=[], isLoading } = useQuery({
    queryKey: ['workout-progress', exercise],
    queryFn: () => api.workoutProgress(exercise),
  })

  // Group by session date, get max weight per session
  const byDate = {}
  data.forEach(row => {
    const d = new Date(row.session_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})
    if (!byDate[d]) byDate[d] = { date:d, maxWeight:0, totalReps:0, sets:0 }
    if (row.weight_lbs > byDate[d].maxWeight) byDate[d].maxWeight = parseFloat(row.weight_lbs)
    byDate[d].totalReps += row.reps || 0
    byDate[d].sets++
  })
  const chartData = Object.values(byDate)

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:14, padding:0 }}>←</button>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>
          {exercise.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} — Progress
        </div>
      </div>
      <div style={{ padding:20 }}>
        {isLoading ? (
          <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Loading...</div>
        ) : chartData.length < 2 ? (
          <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>
            Need at least 2 sessions to show progress chart
          </div>
        ) : (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginBottom:14, letterSpacing:1 }}>MAX WEIGHT PER SESSION</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{top:5,right:10,left:-20,bottom:0}}>
                <CartesianGrid stroke="rgba(255,255,255,.03)"/>
                <XAxis dataKey="date" tick={{...MONO,fill:'#6a7d9a'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{...MONO,fill:'#6a7d9a'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TT} formatter={(v)=>[`${v} lbs`,'Max Weight']}/>
                <Line type="monotone" dataKey="maxWeight" stroke="var(--gold-400)" strokeWidth={2.5} dot={{r:4,fill:'var(--gold-400)',strokeWidth:0}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>

            {/* Set detail table */}
            <div style={{ marginTop:20 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginBottom:10, letterSpacing:1 }}>ALL SETS</div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:300 }}>
                  <thead>
                    <tr>{['Date','Set','Reps','Weight'].map(h=>(
                      <th key={h} style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', textAlign:'left', padding:'6px 10px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {data.map((row,i)=>(
                      <tr key={i}>
                        <td style={{ padding:'7px 10px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>{new Date(row.session_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                        <td style={{ padding:'7px 10px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>{row.set_number || i+1}</td>
                        <td style={{ padding:'7px 10px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--cream)', fontWeight:500 }}>{row.reps || '—'}</td>
                        <td style={{ padding:'7px 10px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--gold-400)', fontWeight:500 }}>{row.weight_lbs ? `${row.weight_lbs} lbs` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session, onDeleteSession, onDeleteSet }) {
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const exercises = session.exercises?.filter(Boolean) || []
  const sets = session.sets || []

  return (
    <div
      onMouseEnter={()=>setHovering(true)}
      onMouseLeave={()=>setHovering(false)}
      style={{ padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: expanded ? 10 : 0 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--cream)', marginBottom:3 }}>
            {new Date(session.session_date).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>
            {session.total_sets} sets
            {session.duration_mins ? ` · ${session.duration_mins} mins` : ''}
            {exercises.length > 0 ? ` · ${exercises.slice(0,3).join(', ')}${exercises.length > 3 ? ` +${exercises.length-3}` : ''}` : ''}
          </div>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {hovering && (
            <button onClick={()=>onDeleteSession(session.id)} style={{
              background:'rgba(224,90,90,.08)', border:'1px solid rgba(224,90,90,.15)',
              color:'var(--danger)', borderRadius:'var(--rs)', padding:'3px 8px',
              cursor:'pointer', fontSize:11,
            }} title="Delete session">✕</button>
          )}
          <button onClick={()=>setExpanded(s=>!s)} style={{ background:'rgba(255,255,255,.05)', border:'none', color:'var(--muted)', borderRadius:'var(--rs)', padding:'3px 8px', cursor:'pointer', fontSize:11 }}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop:8 }}>
          {sets.length > 0 ? (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Exercise','Weight','Reps','Set',''].map(h => (
                    <th key={h} style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', textAlign:'left', padding:'4px 8px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sets.map((set, i) => (
                  <SetRow key={set.id||i} set={set} onDelete={()=>onDeleteSet(set.id)}/>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {exercises.map((ex,i) => (
                <span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:9, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,.05)', color:'var(--cream)' }}>
                  {ex.replace(/_/g,' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SetRow({ set, onDelete }) {
  const [hovering, setHovering] = useState(false)
  return (
    <tr
      onMouseEnter={()=>setHovering(true)}
      onMouseLeave={()=>setHovering(false)}
      style={{ background: hovering ? 'rgba(255,255,255,.02)' : 'transparent' }}
    >
      <td style={{ padding:'6px 8px', fontSize:11, color:'var(--cream)', textTransform:'capitalize' }}>{set.exercise}</td>
      <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>{set.weight_lbs ? `${set.weight_lbs}lbs` : '—'}</td>
      <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>{set.reps || '—'}</td>
      <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>#{set.set_number}</td>
      <td style={{ padding:'6px 8px', textAlign:'right' }}>
        {hovering && (
          <button onClick={onDelete} style={{
            background:'rgba(224,90,90,.08)', border:'1px solid rgba(224,90,90,.15)',
            color:'var(--danger)', borderRadius:4, padding:'1px 6px',
            cursor:'pointer', fontSize:10,
          }}>✕</button>
        )}
      </td>
    </tr>
  )
}

export default function Workouts() {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const qc = useQueryClient()

  const { data: records=[], isLoading: loadingRecords } = useQuery({
    queryKey: ['workout-records'],
    queryFn: api.workoutRecords,
    refetchInterval: 60_000,
  })

  const { data: sessions=[], isLoading: loadingSessions } = useQuery({
    queryKey: ['workouts'],
    queryFn: api.workouts,
    refetchInterval: 60_000,
  })

  const mostRecentSession = sessions[0] || null

  const { data: sessionAnalysis } = useQuery({
    queryKey: ['session-analysis', mostRecentSession?.id],
    queryFn: () => api.sessionAnalysis(mostRecentSession.id),
    enabled: !!mostRecentSession?.id,
  })

  const { data: weeklyAnalysis } = useQuery({
    queryKey: ['weekly-analysis'],
    queryFn: () => api.weeklyAnalysis(),
  })

  const deleteSessionMut = useMutation({
    mutationFn: (id) => api.deleteWorkoutSession(id),
    onSuccess: () => qc.invalidateQueries(['workouts']),
  })

  const deleteSetMut = useMutation({
    mutationFn: (id) => api.deleteWorkoutSet(id),
    onSuccess: () => qc.invalidateQueries(['workouts']),
  })

  if (selectedExercise) {
    return <ProgressChart exercise={selectedExercise} onBack={()=>setSelectedExercise(null)}/>
  }

  // Group records by muscle group
  const byMuscle = {}
  records.forEach(r => {
    const m = r.muscle_group || 'other'
    if (!byMuscle[m]) byMuscle[m] = []
    byMuscle[m].push(r)
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Personal Records */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .4s ease both' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Personal Records</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{records.length} exercises tracked</div>
        </div>
        <div style={{ padding:16 }}>
          {loadingRecords ? (
            <div style={{ textAlign:'center', padding:'24px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Loading...</div>
          ) : records.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>
              <div style={{ fontSize:28, opacity:.2, marginBottom:8 }}>💪</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>Log your first workout via WhatsApp</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, marginTop:6, opacity:.6 }}>Try: "bench press 185 3x8"</div>
            </div>
          ) : (
            Object.entries(byMuscle).map(([muscle, recs]) => (
              <div key={muscle} style={{ marginBottom:16 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color: getMuscleColor(muscle), marginBottom:8 }}>
                  {muscle}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
                  {recs.map((r,i) => (
                    <div key={i} onClick={()=>setSelectedExercise(r.exercise)} style={{ cursor:'pointer' }}>
                      <PRCard record={r} isNew={false}/>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {records.length > 0 && (
          <div style={{ padding:'8px 18px 14px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', textAlign:'center' }}>
              Tap any exercise to see progress chart
            </div>
          </div>
        )}
      </div>

      {/* Session Recap */}
      {mostRecentSession && sessionAnalysis && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'riseIn .45s .05s ease both' }}>
          {/* Volume Breakdown Bars */}
          {sessionAnalysis.muscle_groups?.length > 0 && (() => {
            const maxVol = Math.max(...sessionAnalysis.muscle_groups.map(g => g.volume || 0))
            return (
              <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'14px 18px' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:1.5, color:'var(--muted)', marginBottom:12 }}>VOLUME BREAKDOWN</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {sessionAnalysis.muscle_groups.map(g => (
                    <div key={g.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--cream)', width:80, flexShrink:0, textTransform:'capitalize' }}>{g.name}</div>
                      <div style={{ flex:1, height:14, background:'rgba(255,255,255,.04)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{
                          height:'100%', borderRadius:3,
                          width: maxVol > 0 ? `${(g.volume / maxVol) * 100}%` : '0%',
                          background:'var(--gold-400)',
                          transition:'width .4s ease',
                        }}/>
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', width:50, textAlign:'right', flexShrink:0 }}>{g.volume}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
          <WorkoutInsight mode="session" data={sessionAnalysis}/>
        </div>
      )}

      {/* Recent Sessions */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .1s ease both' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Recent Sessions</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{sessions.length} logged</div>
        </div>
        <div style={{ padding:'4px 18px 14px' }}>
          {loadingSessions ? (
            <div style={{ textAlign:'center', padding:'24px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>
              <div style={{ fontSize:28, opacity:.2, marginBottom:8 }}>⏱</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>No sessions yet</div>
            </div>
          ) : sessions.map(s => <SessionCard key={s.id} session={s} onDeleteSession={id=>deleteSessionMut.mutate(id)} onDeleteSet={id=>deleteSetMut.mutate(id)}/>)}
        </div>
      </div>

      {/* This Week */}
      {weeklyAnalysis && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'riseIn .55s .15s ease both' }}>
          <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'14px 18px', overflow:'hidden' }}>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)', marginBottom:14 }}>This Week</div>

            {/* Consistency bar */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:1.5, color:'var(--muted)' }}>CONSISTENCY</div>
                <div style={{ fontFamily:'var(--font-disp)', fontSize:18, fontWeight:700, color:'var(--cream)' }}>
                  {weeklyAnalysis.sessions_completed}<span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', fontWeight:400 }}>/{weeklyAnalysis.sessions_target} sessions</span>
                </div>
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,.04)', borderRadius:3, overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:3,
                  width: weeklyAnalysis.sessions_target > 0
                    ? `${Math.min(100, (weeklyAnalysis.sessions_completed / weeklyAnalysis.sessions_target) * 100)}%`
                    : '0%',
                  background: weeklyAnalysis.sessions_completed >= weeklyAnalysis.sessions_target ? 'var(--success)' : 'var(--gold-400)',
                  transition:'width .4s ease',
                }}/>
              </div>
            </div>

            {/* Volume change indicators */}
            {weeklyAnalysis.muscle_groups?.length > 0 && (
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:1.5, color:'var(--muted)', marginBottom:10 }}>VOLUME VS LAST WEEK</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {weeklyAnalysis.muscle_groups.map(g => {
                    const pct = g.pct_change || 0
                    const isUp = pct > 5
                    const isDown = pct < -5
                    const color = isUp ? 'var(--success)' : isDown ? 'var(--danger)' : 'var(--muted)'
                    const arrow = isUp ? '↑' : isDown ? '↓' : '→'
                    return (
                      <div key={g.name} style={{
                        background:'rgba(255,255,255,.04)', borderRadius:'var(--rs)',
                        padding:'6px 10px', display:'flex', alignItems:'center', gap:6,
                      }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--cream)', textTransform:'capitalize' }}>{g.name}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color, fontWeight:600 }}>
                          {arrow} {pct > 0 ? '+' : ''}{pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <WorkoutInsight mode="weekly" data={weeklyAnalysis}/>
        </div>
      )}

    </div>
  )
}

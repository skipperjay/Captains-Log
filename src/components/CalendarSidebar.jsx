import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

function groupByDay(events) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const groups = {}

  events.forEach(e => {
    const d = new Date(e.due_date)
    d.setHours(0,0,0,0)
    const diff = Math.round((d - today) / 86400000)
    let label
    if (diff === 0) label = 'Today'
    else if (diff === 1) label = 'Tomorrow'
    else label = d.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })
    if (!groups[label]) groups[label] = { label, diff, events:[] }
    groups[label].events.push(e)
  })

  return Object.values(groups).sort((a,b) => a.diff - b.diff)
}

export default function CalendarSidebar() {
  const { data: events=[], isLoading } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: api.calendarEvents,
    refetchInterval: 300_000,
  })

  const today = new Date()
  const weekOut = new Date(today.getTime() + 7 * 86400000)
  const filtered = events.filter(e => {
    const d = new Date(e.due_date)
    return d >= today && d <= weekOut
  })

  const groups = groupByDay(filtered)

  return (
    <div style={{
      width: 240, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--navy-900)',
        border: '1px solid rgba(255,255,255,.05)',
        borderRadius: 'var(--r) var(--r) 0 0',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.04)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:13, fontWeight:700, color:'var(--cream)' }}>Calendar</div>
          <span style={{ fontSize:14 }}>📅</span>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', marginTop:3, letterSpacing:1 }}>
          {today.toLocaleDateString('en-US',{month:'long',year:'numeric'}).toUpperCase()}
        </div>
      </div>

      {/* Events */}
      <div style={{
        background: 'var(--navy-900)',
        border: '1px solid rgba(255,255,255,.05)',
        borderTop: 'none',
        borderRadius: '0 0 var(--r) var(--r)',
        flex: 1,
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding:'20px 16px', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>Loading...</div>
        ) : groups.length === 0 ? (
          <div style={{ padding:'24px 16px', textAlign:'center' }}>
            <div style={{ fontSize:20, opacity:.2, marginBottom:8 }}>📅</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)' }}>Nothing scheduled</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:4, opacity:.6 }}>Next 7 days are clear</div>
          </div>
        ) : (
          <div style={{ padding:'8px 0 12px' }}>
            {groups.map((group, gi) => (
              <div key={gi}>
                {/* Day header */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 2,
                  textTransform: 'uppercase', padding: '10px 16px 5px',
                  color: group.diff === 0 ? 'var(--gold-400)' : group.diff === 1 ? 'var(--cream)' : 'var(--muted)',
                }}>
                  {group.label}
                  {group.diff === 0 && <span style={{ marginLeft:6, background:'rgba(201,160,48,.12)', padding:'1px 6px', borderRadius:8, fontSize:7 }}>TODAY</span>}
                </div>

                {/* Events */}
                {group.events.map((e, i) => (
                  <div key={i} style={{
                    padding: '7px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    transition: 'background var(--t)',
                    cursor: 'default',
                  }}
                    onMouseEnter={ev => ev.currentTarget.style.background='rgba(255,255,255,.03)'}
                    onMouseLeave={ev => ev.currentTarget.style.background='transparent'}
                  >
                    <div style={{
                      width: 3, height: 3, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                      background: group.diff === 0 ? 'var(--gold-400)' : 'var(--muted)',
                    }}/>
                    <div style={{ fontSize: 11, color: group.diff === 0 ? 'var(--cream)' : 'rgba(240,234,216,.7)', lineHeight: 1.4, wordBreak:'break-word' }}>
                      {e.task}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

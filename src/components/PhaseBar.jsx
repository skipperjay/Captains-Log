import React from 'react'

const PHASES = ['script', 'video', 'editing', 'thumbnail', 'upload']
const PHASE_ICONS = { script:'✍️', video:'🎥', editing:'✂️', thumbnail:'🖼️', upload:'🚀' }

export default function PhaseBar({ phases = [] }) {
  const phaseMap = {}
  phases.forEach(p => { phaseMap[p.phase] = p })

  const completedCount = PHASES.filter(p => phaseMap[p]?.completed).length
  const currentIdx = PHASES.findIndex(p => !phaseMap[p]?.completed)

  if (phases.length === 0) return null

  return (
    <div style={{ marginTop: 8 }}>
      {/* Step dots */}
      <div style={{ display:'flex', alignItems:'center', gap:3 }}>
        {PHASES.map((phase, idx) => {
          const done = phaseMap[phase]?.completed
          const current = idx === currentIdx

          return (
            <React.Fragment key={phase}>
              <div
                title={phase}
                style={{
                  width: done ? 18 : current ? 20 : 14,
                  height: done ? 18 : current ? 20 : 14,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done
                    ? 'var(--success)'
                    : current
                    ? 'rgba(201,160,48,.15)'
                    : 'rgba(255,255,255,.04)',
                  border: done
                    ? '2px solid var(--success)'
                    : current
                    ? '2px solid var(--gold-400)'
                    : '2px solid rgba(255,255,255,.08)',
                  fontSize: done ? 9 : current ? 10 : 8,
                  transition: 'all var(--t)',
                  flexShrink: 0,
                }}
              >
                {done
                  ? <span style={{ color:'white', fontSize:8, fontWeight:700 }}>✓</span>
                  : <span style={{ opacity: current ? 1 : .3 }}>{PHASE_ICONS[phase]}</span>
                }
              </div>
              {idx < PHASES.length - 1 && (
                <div style={{
                  flex: 1, height: 2, borderRadius: 2,
                  background: idx < completedCount
                    ? 'var(--success)'
                    : 'rgba(255,255,255,.05)',
                  transition: 'background .3s ease',
                }}/>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Current phase label */}
      {currentIdx >= 0 && currentIdx < PHASES.length && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--gold-400)', marginTop:5, letterSpacing:.5 }}>
          {PHASES[currentIdx].toUpperCase()}
        </div>
      )}
      {completedCount === PHASES.length && (
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--success)', marginTop:5, letterSpacing:.5 }}>
          ✓ COMPLETE
        </div>
      )}
    </div>
  )
}

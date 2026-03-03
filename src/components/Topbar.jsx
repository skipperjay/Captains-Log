import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const PAGE_TITLES = {
  brief:       ['Daily Brief',     'CAPTAIN\'S LOG / TODAY'],
  pipeline:    ['Content Pipeline','CAPTAIN\'S LOG / CONTENT'],
  projects:    ['Projects',        'CAPTAIN\'S LOG / PROJECTS'],
  ideas:       ['Ideas',           'CAPTAIN\'S LOG / IDEAS'],
  notes:       ['Notes',           'CAPTAIN\'S LOG / NOTES'],
  workouts:    ['Workouts',        'CAPTAIN\'S LOG / FITNESS'],
  performance: ['Performance',     'CAPTAIN\'S LOG / ANALYTICS'],
  review:      ['Daily Review',    'CAPTAIN\'S LOG / REVIEW'],
  health:      ['Process Health',  'CAPTAIN\'S LOG / PROCESS'],
}

export default function Topbar({ page, onToast }) {
  const [syncing, setSyncing] = useState(false)
  const qc = useQueryClient()
  const [title, crumb] = PAGE_TITLES[page] || ['Captain\'s Log', '']

  async function sync() {
    setSyncing(true)
    await qc.invalidateQueries()
    setTimeout(() => { setSyncing(false); onToast('All systems synced', '↻') }, 900)
  }

  return (
    <div style={{
      height: 54,
      background: 'rgba(9,21,37,.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(201,160,48,.08)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 50,
      flexShrink: 0,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <span style={{ fontFamily:'var(--font-disp)', fontSize:16, fontWeight:700, color:'var(--cream)' }}>{title}</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', display:'none' }} className="breadcrumb-desktop">{crumb}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', background:'rgba(255,255,255,.03)', padding:'3px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,.05)' }}>
          {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </span>
        <button onClick={sync} style={{
          display:'flex', alignItems:'center', gap:4,
          padding:'5px 12px', background:'var(--gold-400)',
          color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)',
          fontSize:11, fontWeight:600, cursor:'pointer',
        }}>
          <span style={{ display:'inline-block', animation: syncing ? 'spin .6s linear infinite' : 'none' }}>↻</span>
          <span className="sync-label"> Sync</span>
        </button>
      </div>
      <style>{`
        @media (min-width: 769px) { .breadcrumb-desktop { display: inline !important; } }
        @media (max-width: 480px) { .sync-label { display: none; } }
      `}</style>
    </div>
  )
}

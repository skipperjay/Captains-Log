import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PILLARS } from '../lib/constants'

export default function QuickCapture({ onToast }) {
  const [text, setText] = useState('')
  const [type, setType] = useState('idea')
  const [pillar, setPillar] = useState('build_the_person')
  const qc = useQueryClient()
  const inputRef = useRef()

  const mut = useMutation({
    mutationFn: api.capture,
    onSuccess: () => {
      qc.invalidateQueries(['ideas'])
      setText('')
      inputRef.current?.focus()
      onToast(type === 'idea' ? 'Idea captured' : 'Note saved', type === 'idea' ? '✦' : '◻')
    },
    onError: () => onToast('Failed to save', '✖'),
  })

  function submit() {
    if (!text.trim()) return
    mut.mutate({ text: text.trim(), type, pillar })
  }

  const btnStyle = (active) => ({
    fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:1,
    padding:'5px 12px', borderRadius:20, cursor:'pointer',
    border: active ? '1px solid rgba(201,160,48,.3)' : '1px solid rgba(255,255,255,.07)',
    background: active ? 'rgba(201,160,48,.1)' : 'none',
    color: active ? 'var(--gold-400)' : 'var(--muted)',
    transition:'all var(--t)',
  })

  return (
    <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .5s .2s ease both' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Quick Capture</div>
        <div style={{ display:'flex', gap:5 }}>
          <button style={btnStyle(type==='idea')} onClick={() => setType('idea')}>✦ Idea</button>
          <button style={btnStyle(type==='note')} onClick={() => setType('note')}>◻ Note</button>
        </div>
      </div>
      <div style={{ padding:18 }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) submit() }}
          placeholder={type==='idea' ? "What's the idea? (⌘+Enter to save)" : "What's on your mind? (⌘+Enter to save)"}
          style={{
            width:'100%', background:'var(--navy-800)',
            border:'1px solid rgba(255,255,255,.07)',
            borderRadius:'var(--rs)', padding:'10px 12px',
            color:'var(--cream)', fontSize:13, outline:'none',
            resize:'none', minHeight:72, lineHeight:1.5,
            transition:'border-color var(--t)',
            fontFamily:'var(--font-body)',
          }}
          onFocus={e => e.target.style.borderColor='rgba(201,160,48,.3)'}
          onBlur={e => e.target.style.borderColor='rgba(255,255,255,.07)'}
        />

        {type === 'idea' && (
          <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
            {Object.entries(PILLARS).map(([k,v]) => (
              <button key={k} onClick={() => setPillar(k)} style={{
                fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:.5,
                padding:'4px 10px', borderRadius:20, cursor:'pointer',
                border: pillar===k ? `1px solid ${v.color}44` : '1px solid rgba(255,255,255,.06)',
                background: pillar===k ? v.color+'18' : 'none',
                color: pillar===k ? v.color : 'var(--muted)',
                transition:'all var(--t)',
              }}>{v.label}</button>
            ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
          <button onClick={submit} disabled={!text.trim() || mut.isPending} style={{
            padding:'7px 18px', background:'var(--gold-400)',
            color:'var(--navy-900)', border:'none', borderRadius:'var(--rs)',
            fontSize:12, fontWeight:600, cursor:'pointer',
            opacity: !text.trim() ? .5 : 1, transition:'opacity var(--t)',
          }}>
            {mut.isPending ? 'Saving...' : `Save ${type === 'idea' ? 'Idea' : 'Note'} →`}
          </button>
        </div>
      </div>
    </div>
  )
}

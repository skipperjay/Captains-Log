import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PILLARS } from '../lib/constants'
import ProductionPhases from './ProductionPhases'

const FORMATS = {
  long_form_video:  'Long Form Video',
  short_form_video: 'Short Form Video',
  newsletter:       'Newsletter',
  carousel:         'Carousel',
  image_post:       'Image Post',
  reel:             'Reel',
}

const STAGES = ['backlog','in_progress','review','approved','done']
const STAGE_LABELS = { backlog:'Backlog', in_progress:'In Progress', review:'Review', approved:'Approved', done:'Done' }
const STAGE_COLORS = {
  backlog:     'rgba(255,255,255,.06)',
  in_progress: 'rgba(201,160,48,.1)',
  review:      'rgba(99,179,237,.1)',
  approved:    'rgba(46,200,128,.1)',
  done:        'rgba(255,255,255,.04)',
}
const STAGE_TEXT = {
  backlog:     'var(--muted)',
  in_progress: 'var(--gold-400)',
  review:      '#63b3ed',
  approved:    'var(--success)',
  done:        'var(--muted)',
}

const TABS = [
  { id:'outline',  label:'Outline',   placeholder:'Break the content into sections...\n\n• Hook\n• Main point 1\n• Main point 2\n• Call to action' },
  { id:'script',   label:'Script',    placeholder:'Write your talking points or full script...\n\nOpening:\n\nMain content:\n\nClose:' },
  { id:'research', label:'Research',  placeholder:'Links, references, stats, quotes...\n\nhttps://\n\nKey stats:\n\nSources:' },
  { id:'draft',    label:'Full Draft', placeholder:'Write the full piece here...' },
]

const inp = {
  background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)',
  borderRadius:'var(--rs)', padding:'8px 11px', color:'var(--cream)',
  fontSize:12, outline:'none', fontFamily:'var(--font-body)',
  transition:'border-color var(--t)',
}

function wordCount(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function ContentEditor({ contentId, onBack, onToast }) {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('outline')
  const [localData, setLocalData] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef(null)

  const { data: item, isLoading } = useQuery({
    queryKey: ['content-item', contentId],
    queryFn: () => api.getContent(contentId),
  })

  useEffect(() => {
    if (item && Object.keys(localData).length === 0) {
      setLocalData({
        title:               item.title || '',
        outline:             item.outline || '',
        script:              item.script || '',
        research:            item.research || '',
        draft:               item.draft || '',
        notes:               item.notes || '',
        target_publish_date: item.target_publish_date?.split('T')[0] || '',
        stage:               item.stage || 'backlog',
        pillar:              item.pillar || 'build_the_business',
        format:              item.format || 'long_form_video',
      })
    }
  }, [item])

  const saveMut = useMutation({
    mutationFn: (data) => api.updateContentFull(contentId, data),
    onSuccess: () => {
      qc.invalidateQueries(['content'])
      qc.invalidateQueries(['dashboard'])
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    onError: () => { setSaving(false); onToast('Save failed', '✖') },
  })

  function handleChange(key, value) {
    const updated = { ...localData, [key]: value }
    setLocalData(updated)
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaving(true)
      saveMut.mutate(updated)
    }, 1200)
  }

  function saveNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(true)
    saveMut.mutate(localData)
  }

  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>
      Loading...
    </div>
  )

  const p = PILLARS[localData.pillar] || { label:'Content', color:'var(--muted)' }
  const currentTab = TABS.find(t => t.id === activeTab)
  const draftWords = wordCount(localData.draft)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, animation:'riseIn .3s ease' }}>

      {/* ── Top Bar ── */}
      <div style={{
        background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)',
        borderRadius:'var(--r)', padding:'14px 18px', marginBottom:12,
      }}>
        {/* Back + Save */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <button onClick={onBack} style={{
            display:'flex', alignItems:'center', gap:6,
            background:'none', border:'none', color:'var(--muted)',
            cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:10,
            padding:'4px 0',
          }}>← Pipeline</button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {saving && <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>Saving...</span>}
            {saved && <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--success)' }}>✓ Saved</span>}
            <button onClick={saveNow} disabled={saving} style={{
              fontFamily:'var(--font-mono)', fontSize:9, padding:'5px 14px',
              background:'var(--gold-400)', color:'var(--navy-900)',
              border:'none', borderRadius:'var(--rs)', cursor:'pointer', fontWeight:600,
            }}>Save</button>
          </div>
        </div>

        {/* Title */}
        <input
          value={localData.title || ''}
          onChange={e => handleChange('title', e.target.value)}
          placeholder="Content title..."
          style={{ ...inp, width:'100%', fontSize:16, fontWeight:700, fontFamily:'var(--font-disp)', marginBottom:12, padding:'10px 12px' }}
        />

        {/* Meta row */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>

          {/* Pillar */}
          <select value={localData.pillar||''} onChange={e=>handleChange('pillar',e.target.value)} style={{ ...inp, width:'auto', cursor:'pointer', color:p.color, background:`${p.color}18` }}>
            {Object.entries(PILLARS).map(([k,v]) => <option key={k} value={k} style={{ color:'var(--cream)', background:'var(--navy-800)' }}>{v.label}</option>)}
          </select>

          {/* Format */}
          <select value={localData.format||''} onChange={e=>handleChange('format',e.target.value)} style={{ ...inp, width:'auto', cursor:'pointer' }}>
            {Object.entries(FORMATS).map(([k,v]) => <option key={k} value={k} style={{ background:'var(--navy-800)' }}>{v}</option>)}
          </select>

          {/* Stage */}
          <select value={localData.stage||''} onChange={e=>handleChange('stage',e.target.value)} style={{ ...inp, width:'auto', cursor:'pointer', background:STAGE_COLORS[localData.stage], color:STAGE_TEXT[localData.stage] }}>
            {STAGES.map(s => <option key={s} value={s} style={{ background:'var(--navy-800)', color:'var(--cream)' }}>{STAGE_LABELS[s]}</option>)}
          </select>

          {/* Target publish date */}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>Publish by</span>
            <input
              type="date"
              value={localData.target_publish_date || ''}
              onChange={e => handleChange('target_publish_date', e.target.value)}
              style={{ ...inp, width:'auto', cursor:'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden' }}>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,.04)', padding:'0 18px' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding:'12px 16px', border:'none', background:'none', cursor:'pointer',
              fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:.5,
              color: activeTab===tab.id ? 'var(--cream)' : 'var(--muted)',
              borderBottom: activeTab===tab.id ? '2px solid var(--gold-400)' : '2px solid transparent',
              marginBottom:-1, transition:'all var(--t)',
            }}>
              {tab.label}
              {tab.id==='draft' && localData.draft && (
                <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted)', background:'rgba(255,255,255,.06)', padding:'1px 5px', borderRadius:8 }}>
                  {draftWords}w
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Editor area */}
        <div style={{ padding:'4px 18px 18px' }}>
          {activeTab === 'draft' && (
            <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 0 4px' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>
                {draftWords} words · ~{Math.ceil(draftWords/200)} min read
              </span>
            </div>
          )}
          <textarea
            key={activeTab}
            value={localData[activeTab] || ''}
            onChange={e => handleChange(activeTab, e.target.value)}
            placeholder={currentTab?.placeholder}
            style={{
              ...inp,
              width:'100%', minHeight: activeTab==='draft' ? 480 : 320,
              resize:'vertical', lineHeight:1.8, fontSize:13,
              padding:'14px', fontFamily: activeTab==='draft' ? 'var(--font-body)' : 'var(--font-mono)',
            }}
          />
        </div>
      </div>

      {/* ── Notes ── */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', padding:'14px 18px', marginTop:12 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>Notes & Status</div>
        <textarea
          value={localData.notes || ''}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Why is this blocked? What's the next step? Any context..."
          rows={3}
          style={{ ...inp, width:'100%', resize:'vertical', lineHeight:1.6 }}
        />
      </div>

      {/* ── Production Phases ── */}
      <ProductionPhases
        contentId={contentId}
        phases={item?.phases || []}
        onToast={onToast}
      />
    </div>
  )
}

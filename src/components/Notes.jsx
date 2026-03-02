import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function Notes({ onToast }) {
  const [search, setSearch] = useState('')
  const [newNote, setNewNote] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data: notes=[], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: api.notes,
    refetchInterval: 30_000,
  })

  const addMut = useMutation({
    mutationFn: api.addNote,
    onSuccess: () => { qc.invalidateQueries(['notes']); setNewNote(''); setShowAdd(false); onToast('Note saved', '📝') },
    onError: () => onToast('Failed to save note', '✖'),
  })

  const deleteMut = useMutation({
    mutationFn: api.deleteNote,
    onSuccess: () => { qc.invalidateQueries(['notes']); onToast('Note deleted', '✕') },
    onError: () => onToast('Failed to delete', '✖'),
  })

  const filtered = notes.filter(n => n.body.toLowerCase().includes(search.toLowerCase()))

  function fmtDate(d) {
    const date = new Date(d)
    const today = new Date()
    const diff = Math.floor((today - date) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month:'short', day:'numeric' })
  }

  const inp = { background:'var(--navy-800)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'var(--rs)', padding:'8px 11px', color:'var(--cream)', fontSize:12, outline:'none', fontFamily:'var(--font-body)' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ background:'var(--navy-900)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'var(--r)', overflow:'hidden', animation:'riseIn .4s ease both' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--cream)' }}>Notes</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>{notes.length} saved</div>
            <button onClick={()=>setShowAdd(s=>!s)} style={{
              fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 12px',
              background: showAdd ? 'rgba(201,160,48,.15)' : 'rgba(255,255,255,.05)',
              color: showAdd ? 'var(--gold-400)' : 'var(--muted)',
              border:`1px solid ${showAdd ? 'rgba(201,160,48,.25)' : 'rgba(255,255,255,.08)'}`,
              borderRadius:'var(--rs)', cursor:'pointer',
            }}>+ Add</button>
          </div>
        </div>

        {/* Add note */}
        {showAdd && (
          <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,.04)', background:'rgba(255,255,255,.02)' }}>
            <textarea
              value={newNote} onChange={e=>setNewNote(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              style={{ ...inp, width:'100%', resize:'vertical', marginBottom:8 }}
              autoFocus
              onKeyDown={e=>{ if(e.key==='Enter'&&e.metaKey) { addMut.mutate({ body:newNote })} }}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={()=>setShowAdd(false)} style={{ padding:'5px 12px', background:'none', border:'1px solid rgba(255,255,255,.08)', borderRadius:'var(--rs)', color:'var(--muted)', fontSize:11, cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>addMut.mutate({ body:newNote })} disabled={!newNote.trim()||addMut.isPending} style={{ padding:'5px 14px', background:'var(--gold-400)', border:'none', borderRadius:'var(--rs)', color:'var(--navy-900)', fontSize:11, fontWeight:600, cursor:'pointer' }}>Save Note</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ padding:'10px 18px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{ ...inp, width:'100%' }}
          />
        </div>

        {/* Notes list */}
        <div style={{ padding:'4px 18px 14px' }}>
          {isLoading ? (
            <div style={{ textAlign:'center', padding:'24px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>
              <div style={{ fontSize:24, opacity:.2, marginBottom:8 }}>📝</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>{search ? 'No notes match' : 'No notes yet — add one above or text Waypoint'}</div>
              {!search && <div style={{ fontFamily:'var(--font-mono)', fontSize:10, marginTop:6, opacity:.6 }}>Try: "note: [your thought]"</div>}
            </div>
          ) : filtered.map((note, i) => (
            <NoteCard key={note.id} note={note} fmtDate={fmtDate} onDelete={()=>deleteMut.mutate(note.id)}/>
          ))}
        </div>
      </div>
    </div>
  )
}

function NoteCard({ note, fmtDate, onDelete }) {
  const [hovering, setHovering] = useState(false)
  return (
    <div
      onMouseEnter={()=>setHovering(true)}
      onMouseLeave={()=>setHovering(false)}
      style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', gap:12, alignItems:'flex-start' }}
    >
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, color:'var(--cream)', lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{note.body}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginTop:5 }}>{fmtDate(note.created_at)}</div>
      </div>
      {hovering && (
        <button onClick={onDelete} style={{ background:'rgba(224,90,90,.08)', border:'1px solid rgba(224,90,90,.15)', color:'var(--danger)', borderRadius:'var(--rs)', padding:'2px 8px', fontSize:10, cursor:'pointer', flexShrink:0 }}>✕</button>
      )}
    </div>
  )
}

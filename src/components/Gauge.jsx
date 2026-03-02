import React, { useEffect, useState } from 'react'

const COLORS = { great:'var(--gold-400)', good:'var(--success)', warn:'var(--warn)', critical:'var(--danger)' }
const SHADOWS = { great:'drop-shadow(0 0 10px rgba(201,160,48,.55))', good:'drop-shadow(0 0 10px rgba(46,200,128,.55))', warn:'drop-shadow(0 0 10px rgba(232,148,58,.55))', critical:'drop-shadow(0 0 10px rgba(224,90,90,.55))' }
const STATUS  = { great:'⚓ STRONG EXECUTION', good:'✓ ON TRACK', warn:'⚠ NEEDS ATTENTION', critical:'✖ OFF COURSE' }
const STATUS_BG = { great:'rgba(201,160,48,.1)', good:'rgba(46,200,128,.1)', warn:'rgba(232,148,58,.1)', critical:'rgba(224,90,90,.1)' }

function cls(pct) { return pct>=80?'great':pct>=60?'good':pct>=40?'warn':'critical' }

export default function Gauge({ pct=0, label='', sub='', size='large' }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(()=>setAnim(true),150); return ()=>clearTimeout(t) }, [pct])

  const isLarge = size === 'large'
  const W = isLarge ? 240 : 180
  const H = isLarge ? 140 : 105
  const R = isLarge ? 96 : 72
  const CX = W/2, CY = H - 10
  const SW = isLarge ? 15 : 12
  const ARC = Math.PI * R
  const offset = anim ? ARC - (pct/100)*ARC : ARC
  const c = cls(pct)

  // Arc path helper
  const arcPath = `M ${CX-R} ${CY} A ${R} ${R} 0 0 1 ${CX+R} ${CY}`

  return (
    <div style={{
      background:'var(--navy-900)',
      border:'1px solid rgba(201,160,48,.12)',
      borderRadius:'var(--r)',
      padding: isLarge ? '28px 32px 24px' : '20px 24px 18px',
      display:'flex', flexDirection:'column', alignItems:'center',
      position:'relative', overflow:'hidden',
      animation:'riseIn .5s ease both',
      flex: 1,
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold-400),transparent)' }} />
      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom: isLarge ? 18 : 12, textAlign:'center' }}>
        {label}
      </div>
      <div style={{ position:'relative', width:W, height:H, marginBottom: isLarge ? 12 : 8 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d={arcPath} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={SW} strokeLinecap="round"/>
          <path d={arcPath} fill="none" stroke={COLORS[c]} strokeWidth={SW} strokeLinecap="round"
            strokeDasharray={ARC} strokeDashoffset={offset}
            style={{ transition:'stroke-dashoffset 1.3s cubic-bezier(.34,1.56,.64,1),stroke .6s ease', filter:SHADOWS[c] }}
          />
        </svg>
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', textAlign:'center', whiteSpace:'nowrap' }}>
          <div style={{ fontFamily:'var(--font-disp)', fontSize: isLarge ? 56 : 38, fontWeight:900, color:COLORS[c], lineHeight:1, transition:'color .6s ease' }}>
            {Math.round(pct)}%
          </div>
        </div>
      </div>
      {sub && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginBottom:8, textAlign:'center' }}>{sub}</div>}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:.8, padding:'3px 14px', borderRadius:20, background:STATUS_BG[c], color:COLORS[c] }}>
        {pct>=100?'⚓ PERFECT EXECUTION':STATUS[c]}
      </div>
    </div>
  )
}

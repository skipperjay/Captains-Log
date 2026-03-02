import React from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MONO = { fontFamily:'DM Mono,monospace', fontSize:9 }
const TT = { background:'#091525', border:'1px solid rgba(201,160,48,.2)', borderRadius:6, fontFamily:'DM Mono,monospace', fontSize:11, color:'#f0ead8' }
const PILLAR_COLORS = { build_the_person:'#63b3ed', understand_the_economy:'#c9a030', build_the_asset:'#2ec880' }
const PILLAR_LABELS = { build_the_person:'Build the Person', understand_the_economy:'Understand the Economy', build_the_asset:'Build the Asset' }

export function GrowthChart({ data=[] }) {
  const d = data.map(r => ({
    label: new Date(r.date||r.snapshot_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
    yt: r.yt||r.yt_subscribers||0, ig: r.ig||r.ig_followers||0,
  }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={d} margin={{top:5,right:10,left:-20,bottom:0}}>
        <CartesianGrid stroke="rgba(255,255,255,.03)"/>
        <XAxis dataKey="label" tick={{...MONO,fill:'#6a7d9a'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{...MONO,fill:'#6a7d9a'}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={TT}/>
        <Legend wrapperStyle={{...MONO,color:'#6a7d9a',paddingTop:8}}/>
        <Line type="monotone" dataKey="yt" name="YouTube" stroke="#c9a030" strokeWidth={2} dot={{r:3,fill:'#c9a030'}}/>
        <Line type="monotone" dataKey="ig" name="Instagram" stroke="#63b3ed" strokeWidth={2} dot={{r:3,fill:'#63b3ed'}}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PillarChart({ data={} }) {
  const entries = Object.entries(data).filter(([,v])=>v>0)
  if (!entries.length) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:180,color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:11}}>No content yet</div>
  const chartData = entries.map(([k,v])=>({ name:PILLAR_LABELS[k]||k, value:v, color:PILLAR_COLORS[k]||'#888' }))
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="45%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
          {chartData.map((e,i)=><Cell key={i} fill={e.color+'33'} stroke={e.color} strokeWidth={2}/>)}
        </Pie>
        <Tooltip contentStyle={TT}/>
        <Legend wrapperStyle={{...MONO,color:'#6a7d9a'}}/>
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ExecChart({ data=[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{top:5,right:10,left:-20,bottom:0}}>
        <CartesianGrid stroke="rgba(255,255,255,.03)"/>
        <XAxis dataKey="week" tick={{...MONO,fill:'#6a7d9a'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{...MONO,fill:'#6a7d9a'}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={TT}/>
        <Legend wrapperStyle={{...MONO,color:'#6a7d9a',paddingTop:8}}/>
        <Bar dataKey="planned" name="Planned" fill="rgba(255,255,255,.06)" radius={[3,3,0,0]}/>
        <Bar dataKey="published" name="Published" fill="rgba(201,160,48,.35)" stroke="#c9a030" strokeWidth={1} radius={[3,3,0,0]}/>
      </BarChart>
    </ResponsiveContainer>
  )
}

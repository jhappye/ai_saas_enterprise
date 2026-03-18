'use client'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function UsageChart() {
  const data = [
    { day: 'Mon', tokens: 1200 },
    { day: 'Tue', tokens: 2100 },
    { day: 'Wed', tokens: 800 },
    { day: 'Thu', tokens: 2600 },
    { day: 'Fri', tokens: 1800 },
  ]
  return (
    <div className="card h-80">
      <h3 className="mb-4 text-xl font-semibold">用量趋势</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="tokens" fill="#06b6d4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

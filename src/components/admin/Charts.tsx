'use client'
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const money = (n: number) => Math.round(n).toLocaleString('vi-VN') + 'đ'
const short = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'tr' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n))
const tick = { fontSize: 12, fill: '#7a5a46' }

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,42,23,.12)" vertical={false} />
        <XAxis dataKey="date" tick={tick} tickLine={false} interval="preserveStartEnd" minTickGap={18} />
        <YAxis yAxisId="l" tick={tick} tickLine={false} axisLine={false} tickFormatter={short} />
        <YAxis yAxisId="r" orientation="right" tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip formatter={(v: number, n: string) => (n === 'Doanh thu' ? money(v) : v)} contentStyle={{ borderRadius: 10, border: '1px solid rgba(90,42,23,.2)' }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar yAxisId="l" dataKey="revenue" name="Doanh thu" fill="#b4562b" radius={[5, 5, 0, 0]} />
        <Line yAxisId="r" type="monotone" dataKey="orders" name="Số đơn" stroke="#4e7a38" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function Donut({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (!data.length) return <div className="adm-empty">Chưa có dữ liệu</div>
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} label={({ value }) => value}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 10 }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TopProducts({ data }: { data: { name: string; qty: number; revenue: number }[] }) {
  if (!data.length) return <div className="adm-empty">Chưa có dữ liệu</div>
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 46)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,42,23,.12)" horizontal={false} />
        <XAxis type="number" tick={tick} tickLine={false} tickFormatter={short} />
        <YAxis type="category" dataKey="name" width={150} tick={tick} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: number, n: string) => (n === 'Doanh thu' ? money(v) : v)} contentStyle={{ borderRadius: 10 }} />
        <Bar dataKey="revenue" name="Doanh thu" fill="#5a2a17" radius={[0, 5, 5, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Dot
} from 'recharts';

const NAVY       = '#191970';
const NAVY_LIGHT = '#e8eaf6';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-lg"
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-base font-black" style={{ color: NAVY }}>
        {payload[0].value} rental{payload[0].value !== 1 ? 's' : ''}
      </p>
    </motion.div>
  );
};

// ─── Custom Dot ───────────────────────────────────────────────────────────────
const CustomDot = (props) => {
  const { cx, cy, value } = props;
  if (value === 0) return null;
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={5}
      fill="#fff"
      stroke={NAVY}
      strokeWidth={2.5}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeeklyRentalsChart({ rentals = [] }) {

  const chartData = useMemo(() => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = daysOfWeek.map((day) => ({ day, rentals: 0 }));

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    rentals.forEach((rental) => {
      const createdAt = new Date(rental.createdAt || rental.startDate);
      if (createdAt >= startOfWeek) {
        let dayIndex = createdAt.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6;
        if (dayIndex >= 0 && dayIndex <= 6) {
          data[dayIndex].rentals += 1;
        }
      }
    });

    return data;
  }, [rentals]);

  const totalThisWeek = chartData.reduce((sum, d) => sum + d.rentals, 0);
  const peakDay = chartData.reduce((best, d) => (d.rentals > best.rentals ? d : best), { day: '', rentals: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-base font-black uppercase tracking-tight"
            style={{ color: NAVY }}
          >
            Weekly Rentals
          </h3>
          <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mt-0.5">
            This week
          </p>
        </div>
        {totalThisWeek > 0 && (
          <div
            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
            style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}
          >
            {totalThisWeek} total · {peakDay.day} peak
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 w-full" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 4, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ECEFF1"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }}
              dx={-6}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: '#ECEFF1', strokeWidth: 2 }}
              content={<CustomTooltip />}
            />
            <Line
              type="monotone"
              dataKey="rentals"
              stroke={NAVY}
              strokeWidth={2.5}
              dot={<CustomDot />}
              activeDot={{ r: 7, fill: NAVY, stroke: '#fff', strokeWidth: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
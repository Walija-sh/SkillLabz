import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
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
        Rs. {payload[0].value.toLocaleString()}
      </p>
    </motion.div>
  );
};

// ─── Animated Bar shape ───────────────────────────────────────────────────────
const AnimatedBar = (props) => {
  const { x, y, width, height, fill, index } = props;
  if (!height || height <= 0) return null;
  return (
    <motion.rect
      x={x}
      width={width}
      initial={{ y: y + height, height: 0 }}
      animate={{ y, height }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index || 0) * 0.07 }}
      fill={fill}
      rx={5}
      ry={5}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MonthlyEarningsChart({ rentals = [] }) {

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      data.push({
        month: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        earnings: 0,
      });
    }

    rentals.forEach((rental) => {
      if (rental.rentalStatus === 'completed') {
        const endDate = new Date(rental.endDate);
        const target  = data.find(
          (m) => m.monthIndex === endDate.getMonth() && m.year === endDate.getFullYear()
        );
        if (target) {
          const startDate = new Date(rental.startDate);
          const days = Math.max(1, Math.ceil((endDate - startDate) / 86400000));
          target.earnings += days * rental.pricePerDay;
        }
      }
    });

    return data;
  }, [rentals]);

  const maxEarnings = Math.max(...chartData.map((d) => d.earnings), 0);

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
            Monthly Earnings
          </h3>
          <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mt-0.5">
            Last 6 months
          </p>
        </div>
        {maxEarnings > 0 && (
          <div
            className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest"
            style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}
          >
            Rs. {maxEarnings.toLocaleString()} peak
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 w-full" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ECEFF1"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }}
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
              dx={-6}
            />
            <Tooltip
              cursor={{ fill: '#ECEFF1', radius: 6 }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="earnings"
              radius={[5, 5, 0, 0]}
              barSize={36}
              shape={<AnimatedBar />}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.earnings === maxEarnings && maxEarnings > 0 ? NAVY : `${NAVY}55`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
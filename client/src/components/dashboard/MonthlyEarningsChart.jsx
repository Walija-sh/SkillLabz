import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonthlyEarningsChart({ rentals = [] }) {
  
  // Dynamically calculate the last 6 months of earnings
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // 1. Generate the labels for the last 6 months (e.g., Oct, Nov, Dec, Jan, Feb, Mar)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      data.push({
        month: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        earnings: 0
      });
    }

    // 2. Loop through rentals and add earnings to the correct month
    rentals.forEach(rental => {
      if (rental.rentalStatus === 'completed') {
        const endDate = new Date(rental.endDate);
        
        // Find if this rental belongs in one of our 6 display months
        const targetMonth = data.find(m => m.monthIndex === endDate.getMonth() && m.year === endDate.getFullYear());
        
        if (targetMonth) {
          const startDate = new Date(rental.startDate);
          // Calculate days (minimum 1 day)
          const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
          targetMonth.earnings += (days * rental.pricePerDay);
        }
      }
    });

    return data;
  }, [rentals]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-900 mb-6">Monthly Earnings</h3>
      <div className="flex-1 w-full min-h-62.5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
            <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => `Rs. ${value}`} />
            <Bar dataKey="earnings" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
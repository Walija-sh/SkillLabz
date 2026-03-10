import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyRentalsChart({ rentals = [] }) {
  
  // Dynamically calculate the rental requests for the current week
  const chartData = useMemo(() => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // 1. Initialize data array with 0 rentals for each day
    const data = daysOfWeek.map(day => ({ day, rentals: 0 }));

    // 2. Figure out what date the current Monday was
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0); // Reset to midnight

    // 3. Count rentals created this week
    rentals.forEach(rental => {
      // Use createdAt to see when the request was made
      const createdAt = new Date(rental.createdAt || rental.startDate); 
      
      if (createdAt >= startOfWeek) {
        let dayIndex = createdAt.getDay() - 1; // 0 = Mon, 6 = Sun
        if (dayIndex === -1) dayIndex = 6; // Fix for Sunday (which is normally 0)
        
        if (dayIndex >= 0 && dayIndex <= 6) {
          data[dayIndex].rentals += 1;
        }
      }
    });

    return data;
  }, [rentals]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-900 mb-6">Weekly Rentals</h3>
      <div className="flex-1 w-full min-h-62.5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line 
              type="monotone" 
              dataKey="rentals" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
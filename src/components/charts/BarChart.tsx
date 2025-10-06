import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
}

export const CustomBarChart: React.FC<BarChartProps> = ({ data, dataKeys, xAxisKey }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey={xAxisKey} stroke="#6B7280" fontSize={12} fontWeight={500} />
        <YAxis stroke="#6B7280" fontSize={12} fontWeight={500} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '2px solid #FBBF24',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontWeight: 600,
          }}
          cursor={{ fill: '#FEF3C7' }}
        />
        <Legend wrapperStyle={{ fontWeight: 600 }} />
        {dataKeys.map((item) => (
          <Bar key={item.key} dataKey={item.key} fill={item.color} name={item.name} radius={[8, 8, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;

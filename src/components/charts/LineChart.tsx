import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
}

export const CustomLineChart: React.FC<LineChartProps> = ({ data, dataKeys, xAxisKey }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
          cursor={{ stroke: '#FBBF24', strokeWidth: 2 }}
        />
        <Legend wrapperStyle={{ fontWeight: 600 }} />
        {dataKeys.map((item) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            stroke={item.color}
            strokeWidth={3}
            name={item.name}
            dot={{ fill: item.color, r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 0, fill: item.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
}

export const CustomPieChart: React.FC<PieChartProps> = ({ 
  data, 
  colors = ['#FBBF24', '#FCD34D', '#000000', '#374151', '#6B7280', '#10B981', '#3B82F6'] 
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '2px solid #FBBF24',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontWeight: 600,
          }}
        />
        <Legend wrapperStyle={{ fontWeight: 600 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;

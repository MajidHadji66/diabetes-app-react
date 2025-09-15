
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';
import { GlucoseReading } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface GlucoseChartProps {
  data: GlucoseReading[];
  height?: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const time = new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-bold text-primary-500">{`${payload[0].value} mg/dL`}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
        </div>
      );
    }
    return null;
};


const GlucoseChart: React.FC<GlucoseChartProps> = ({ data, height = 300 }) => {
  const { state } = useAppContext();
  const { min, max } = state.settings.glucoseTargetRange;
  const isDarkMode = state.settings.theme === 'dark';

  const formattedData = data.map(d => ({
    ...d,
    time: d.timestamp.getTime(),
  }));

  const yDomain = [
    Math.min(40, ...data.map(d => d.value)) - 10,
    Math.max(250, ...data.map(d => d.value)) + 10,
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4A5568' : '#E2E8F0'} />
        <XAxis
          dataKey="time"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
          stroke={isDarkMode ? '#A0AEC0' : '#4A5568'}
        />
        <YAxis domain={yDomain} stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceArea y1={min} y2={max} fill="#10B981" fillOpacity={0.1} label={{ value: 'Target Range', position: 'insideTopLeft', fill: '#10B981', fontSize: 12, dy:-5, dx:10 }} />
        <Line type="monotone" dataKey="value" name="Glucose (mg/dL)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GlucoseChart;

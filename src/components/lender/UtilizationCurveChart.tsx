"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock data for the utilization curve
const data = [
  { utilization: 0, interestRate: 2 },
  { utilization: 20, interestRate: 4 },
  { utilization: 40, interestRate: 6 },
  { utilization: 60, interestRate: 9 },
  { utilization: 80, interestRate: 15 },
  { utilization: 90, interestRate: 25 },
  { utilization: 100, interestRate: 50 },
];

export const UtilizationCurveChart = () => {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <XAxis 
            dataKey="utilization" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Utilization', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderColor: "#4b5563",
              fontSize: 12,
            }}
            labelStyle={{ color: "#d1d5db" }}
            formatter={(value) => [`${value}%`, "Interest Rate"]}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Line
            type="monotone"
            dataKey="interestRate"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Interest Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '周一', usage: 400 },
  { name: '周二', usage: 600 },
  { name: '周三', usage: 300 },
  { name: '周四', usage: 700 },
  { name: '周五', usage: 900 },
  { name: '周六', usage: 1200 },
  { name: '周日', usage: 800 },
];

export default function UsageTrendChart() {
  return (
    <div className="my-8 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">过去 7 天使用趋势</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

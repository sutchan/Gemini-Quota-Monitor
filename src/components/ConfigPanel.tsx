'use client';

import { useState } from 'react';

export default function ConfigPanel() {
  const [limit, setLimit] = useState(1500);
  const [notify, setNotify] = useState(false);

  const handleNotifyToggle = async () => {
    if (!notify && 'Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotify(true);
      }
    } else {
      setNotify(!notify);
    }
  };

  return (
    <div id="config-panel" className="my-8 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">脚本设置 (配置预览)</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="daily-limit-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            每日额度阈值
          </label>
          <input
            id="daily-limit-input"
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="notify-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            接近上限时启用浏览器通知
          </label>
          <button
            id="notify-toggle"
            onClick={handleNotifyToggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              notify ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notify ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
      
      <button className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
        保存配置
      </button>
    </div>
  );
}

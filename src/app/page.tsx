'use client';

import ThemeToggle from '@/components/ThemeToggle';
import LiveStatusWidget from '@/components/LiveStatusWidget';
import ResetIndicator from '@/components/ResetIndicator';
import UsageTrendChart from '@/components/UsageTrendChart';
import ConfigPanel from '@/components/ConfigPanel';

export default function Page() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gemini Quota Monitor</h1>
          <ThemeToggle />
        </div>
        
        <p className="text-lg">Gemini Quota Monitor 是一款 Tampermonkey 用户脚本，旨在跟踪并显示 Gemini 免费层级额度在不同 Google 域名（AI Studio 和 Gemini Web）上的使用情况。</p>
        
        <ResetIndicator />
        <UsageTrendChart />
        <ConfigPanel />

        <h2>功能特性</h2>
        <ul>
          <li>跨站跟踪：监控 aistudio.google.com 和 gemini.google.com 上的请求。</li>
          <li>实时同步：在多个打开的浏览器标签页/窗口之间同步使用数据。</li>
          <li>自动重置：每日 UTC 00:00 自动重置使用计数器。</li>
          <li>交互式 UI：浮动、高优先级的 UI，支持拖拽移动和折叠功能。</li>
        </ul>

        <h2>入门指南 (Getting Started)</h2>
        <ol>
          <li><strong>安装扩展</strong>：确保您的浏览器已安装 <a href="https://www.tampermonkey.net/">Tampermonkey</a> 扩展。</li>
          <li><strong>安装脚本</strong>：点击下方链接进行一键安装：<br/>
             <a href="https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/src/scripts/gemini-quota-monitor.user.js">点击安装 Gemini Quota Monitor</a>
          </li>
          <li><strong>验证安装</strong>：
            <ul>
              <li>访问 <a href="https://aistudio.google.com/">Google AI Studio</a> 或 <a href="https://gemini.google.com/">Gemini Web</a>。</li>
              <li>页面右上角或特定位置应出现一个浮动的小窗口。</li>
              <li>若未出现，请点击浏览器工具栏的 Tampermonkey 图标，确认脚本已启用。</li>
            </ul>
          </li>
        </ol>

        <h2>安装与使用</h2>
        <p>安装完成后，脚本将在访问上述站点时自动生效。</p>
      </div>
      <LiveStatusWidget />
    </main>
  );
}

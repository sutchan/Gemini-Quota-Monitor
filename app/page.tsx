export default function Page() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Gemini Quota Monitor</h1>
      <p>Gemini Quota Monitor 是一款 Tampermonkey 用户脚本，旨在跟踪并显示 Gemini 免费层级额度在不同 Google 域名（AI Studio 和 Gemini Web）上的使用情况。</p>
      
      <h2>功能特性</h2>
      <ul>
        <li>跨站跟踪：监控 aistudio.google.com 和 gemini.google.com 上的请求。</li>
        <li>实时同步：在多个打开的浏览器标签页/窗口之间同步使用数据。</li>
        <li>自动重置：每日 UTC 00:00 自动重置使用计数器。</li>
        <li>交互式 UI：浮动、高优先级的 UI，支持拖拽移动和折叠功能。</li>
      </ul>

      <h2>安装与使用</h2>
      <p>请安装 Tampermonkey 扩展后安装脚本。</p>
      <a href="https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/gemini-quota-monitor.user.js">点击安装脚本</a>
    </main>
  );
}

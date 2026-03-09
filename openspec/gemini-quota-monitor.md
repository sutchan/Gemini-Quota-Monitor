# Gemini Quota Monitor 规范文档

## 1. 概述
Gemini Quota Monitor 是一款 Tampermonkey 用户脚本，旨在跟踪并显示 Gemini 免费层级额度在不同 Google 域名（AI Studio 和 Gemini Web）上的使用情况。

## 2. 目的
为用户提供一个实时的、持久的视觉指示器，显示其每日 Gemini API 使用量，帮助用户有效管理额度并避免意外的速率限制。

## 3. 关键特性
- **跨站跟踪**：监控 `aistudio.google.com` 和 `gemini.google.com` 上的请求。
- **实时同步**：使用 `GM_addValueChangeListener` 在多个打开的浏览器标签页/窗口之间同步使用数据。
- **自动重置**：每日 UTC 00:00 自动重置使用计数器。
- **非侵入式 UI**：一个浮动的、半透明的、高优先级的 UI 元素，显示当前使用量与每日限额。

## 4. 技术实现
- **平台**：Tampermonkey (Userscript)。
- **持久化**：使用 `GM_setValue` 和 `GM_getValue` 进行跨站点数据存储。
- **拦截**：覆盖 `window.fetch` 以拦截并统计对关键端点（`runStreamingGenerateContent`, `SendMessage`, `generate_content`）的 API 请求。
- **UI 注入**：动态注入一个带有高优先级 CSS (`!important`) 和 `z-index` 的 `div` 元素，以确保可见性。
- **健壮性**：使用 `setInterval` 定期重新注入 UI，以防被宿主站点的 SPA（单页应用）导航移除。

## 5. 配置
- **DAILY_LIMIT**：可配置的每日额度限制（默认：1500）。
- **STORAGE_KEY**：用于 `GM_` 存储的键。

## 6. 使用方法
1. 安装 Tampermonkey 浏览器扩展。
2. 在 Tampermonkey 中新建脚本。
3. 粘贴 `gemini-quota-monitor.user.js` 代码。
4. 保存并访问 `aistudio.google.com` 或 `gemini.google.com`。

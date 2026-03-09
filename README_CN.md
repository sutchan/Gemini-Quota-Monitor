# Gemini Quota Monitor

Gemini Quota Monitor 是一款 Tampermonkey 用户脚本，旨在跟踪并显示 Gemini 免费层级额度在不同 Google 域名（AI Studio 和 Gemini Web）上的使用情况。

[English Version](README.md)

## 功能特性
- **跨站跟踪**：监控 `aistudio.google.com` 和 `gemini.google.com` 上的请求。
- **实时同步**：在多个打开的浏览器标签页/窗口之间同步使用数据。
- **自动重置**：每日 UTC 00:00 自动重置使用计数器。
- **非侵入式 UI**：一个浮动的、半透明的、高优先级的 UI 元素。

## 安装方法
1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展。
2. 在 Tampermonkey 中新建脚本。
3. 复制并粘贴 `gemini-quota-monitor.user.js` 中的代码。
4. 保存并访问 `aistudio.google.com` 或 `gemini.google.com`。

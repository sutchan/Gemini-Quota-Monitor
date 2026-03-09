# Gemini Quota Monitor

Gemini Quota Monitor 是一款 Tampermonkey 用户脚本，旨在跟踪并显示 Gemini 免费层级额度在不同 Google 域名（AI Studio 和 Gemini Web）上的使用情况。

[English Version](README.md)

## 功能特性
- **跨站跟踪**：监控 `aistudio.google.com` 和 `gemini.google.com` 上的请求。
- **实时同步**：在多个打开的浏览器标签页/窗口之间同步使用数据。
- **自动重置**：每日 UTC 00:00 自动重置使用计数器。
- **交互式 UI**：浮动、高优先级的 UI，支持拖拽移动和折叠功能。

## 安装方法
1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展。
2. 点击下方链接直接安装脚本：
   [**一键安装 Gemini Quota Monitor**](https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/gemini-quota-monitor.user.js)

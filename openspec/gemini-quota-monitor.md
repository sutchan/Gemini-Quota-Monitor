# Gemini Quota Monitor 规范文档

## 1. 概述
Gemini Quota Monitor 是一款 Tampermonkey 用户脚本，旨在跟踪并显示 Gemini 免费层级额度在不同 Google 域名（AI Studio 和 Gemini Web）上的使用情况。

## 2. 目的
为用户提供一个实时的、持久的视觉指示器，显示其每日 Gemini API 使用量，帮助用户有效管理额度并避免意外的速率限制。

## 3. 关键特性
- **跨站跟踪**：监控 `aistudio.google.com` 和 `gemini.google.com` 上的请求。
- **实时同步**：使用 `GM_addValueChangeListener` 在多个打开的浏览器标签页/窗口之间同步使用数据。
- **自动重置**：每日 UTC 00:00 自动重置使用计数器。
- **交互式 UI**：浮动、高优先级的 UI，支持拖拽移动和折叠功能。
- **国际化支持**：自动检测浏览器语言，支持英文和中文界面。
- **多模型配置**：内置多个 Gemini 模型的日限配置，支持用户自定义。
- **调试模式**：提供调试日志功能。

## 4. 技术实现
- **平台**：Tampermonkey (Userscript)。
- **持久化**：使用 `GM_setValue` 和 `GM_getValue` 进行跨站点数据存储。
- **拦截**：覆盖 `window.fetch` 以拦截并统计对关键端点（`runStreamingGenerateContent`, `SendMessage`, `generate_content`）的 API 请求。
- **UI 注入**：使用原生 DOM API 动态注入 UI，并结合 `MutationObserver` 确保 UI 的持久性。
- **健壮性**：支持拖拽移动和折叠功能，增强用户体验。

## 5. 配置
- **MODEL_LIMITS**：内置模型日限配置。
- **STORAGE_KEY**：用于 `GM_` 存储使用统计的键。
- **SETTINGS_KEY**：用于 `GM_` 存储用户设置的键。

## 6. 使用方法
1. 安装 Tampermonkey 浏览器扩展。
2. 点击 README 中的一键安装链接即可安装。

## 7. 文件结构
```
/workspace/
├── README.md              # 中文主文档
├── README_EN.md           # 英文文档
├── openspec/
│   └── gemini-quota-monitor.md  # 规范文档
├── CHANGELOG.md           # 变更日志
├── metadata.json          # 元数据
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── gemini-quota-monitor.user.js  # 主脚本
```

## 8. 代码质量标准
- 所有代码文件第一行必须包含文件路径和版本号注释
- 遵循 JavaScript 最佳实践
- 保持代码风格一致
- 添加适当的注释
- 支持国际化

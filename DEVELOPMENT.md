# 开发指南 (Development Guide)

## 项目概述
Gemini Quota Monitor 是一个 Tampermonkey 用户脚本，用于监控 Gemini 免费额度。项目核心包含一个用户脚本文件和一个用于项目展示的 Next.js 前端页面。

## 目录结构
- `/gemini-quota-monitor.user.js`: 核心用户脚本文件，负责拦截请求和 UI 渲染。
- `/app/`: Next.js 前端展示页面。
- `/package.json`: 项目依赖和脚本配置。

## 开发与调试
1. **用户脚本开发**:
   - 直接修改 `/gemini-quota-monitor.user.js`。
   - 在开发过程中，利用脚本内的“调试模式”查看控制台输出，定位新的 API 接口路径。

2. **前端页面开发**:
   - 项目使用 Next.js 构建。
   - 使用 `npm run dev` 启动开发服务器。
   - 修改 `/app/` 下的页面代码以更新展示页面。

## 发布流程
1. 更新 `gemini-quota-monitor.user.js` 中的版本号。
2. 确保 `README.md` 和 `README_CN.md` 已更新。
3. 将脚本发布至您的 GitHub 仓库。

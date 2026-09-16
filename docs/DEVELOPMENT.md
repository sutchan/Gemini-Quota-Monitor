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
1. 更新 `src/scripts/gemini-quota-monitor.user.js` 中的 `@version`。
2. 在 `docs/CHANGELOG.md` 顶部补充对应版本条目（版本号需与 `@version` 一致）。
3. 确保 `README.md` 和 `README_CN.md` 已更新。
4. 打标签并推送，Release 工作流会自动创建发布：
   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```
   标签版本、脚本 `@version`、CHANGELOG 最新版本三者不一致时，Release 工作流会直接失败。

## CI/CD
仓库通过 GitHub Actions 完成自动构建、测试与部署，工作流位于 `.github/workflows/`：

| 工作流 | 触发时机 | 职责 |
| --- | --- | --- |
| `ci.yml` | PR / push main | 用户脚本语法与元数据校验、单元测试；展示站类型检查与构建 |
| `cd.yml` | push main | 静态导出展示站并部署到 GitHub Pages，同时附带用户脚本 |
| `release.yml` | push tag `v*` | 校验版本一致性后创建 Release 并上传用户脚本 |

本地可执行的等价命令：
```bash
npm run validate:script   # 用户脚本元数据与合规校验
npm test                  # 单元测试（Node 内置 test runner）
npm run typecheck         # TypeScript 类型检查
npm run build             # 构建展示站
```

用户脚本没有编译期，而它是通过 `main` 分支的 raw 地址直接分发的
（`@updateURL` / `@downloadURL`），一旦合入即推送给所有在线用户，
因此 `validate:script` 会把元数据错误（例如漏写 `@grant`、版本号非法、
`@match` 缺失）前移到 CI 拦截。

首次部署 Pages 需在仓库 **Settings → Pages → Source** 选择 `GitHub Actions`；
部署完成后脚本的稳定下载地址为
`https://<用户名>.github.io/Gemini-Quota-Monitor/gemini-quota-monitor.user.js`。

#!/usr/bin/env node
/**
 * 用户脚本静态校验器
 *
 * Tampermonkey 脚本没有编译期，头元数据（==UserScript==）写错只会在用户浏览器里运行时炸，
 * 而本项目通过 raw.githubusercontent 的 main 分支直接分发 —— 一旦合入即推给所有在线用户。
 * 因此把这类错误前移到 CI：语法、元数据完整性、@grant 与实现一致性、版本一致性、隐私合规。
 *
 * 用法：node scripts/validate-userscript.mjs [脚本路径]
 * 退出码：0 通过（可含警告） / 1 存在错误
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const DEFAULT_SCRIPT_PATH = 'src/scripts/gemini-quota-monitor.user.js';
export const CHANGELOG_PATH = 'docs/CHANGELOG.md';

const REQUIRED_FIELDS = ['@name', '@namespace', '@version', '@description', '@match'];
const REQUIRED_MATCH_HOSTS = ['aistudio.google.com', 'gemini.google.com'];
const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const GM_API_RE = /\bGM_[A-Za-z_][A-Za-z0-9_]*/g;
const DEBUGGER_RE = /^\s*debugger\s*;?\s*$/gm;
// 排除元数据块后，代码里出现的绝对外链（用于隐私合规扫描）
const ABSOLUTE_URL_RE = /https?:\/\/[^\s"'`)]+/g;
const URL_ALLOWLIST = ['github.com', 'greasyfork.org', 'tampermonkey.net', 'google.com'];

/** 解析 ==UserScript== 元数据块，返回 key -> string[] */
export function parseMetaBlock(source) {
  const blockMatch = source.match(/\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/);
  if (!blockMatch) return null;

  const meta = new Map();
  for (const rawLine of blockMatch[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    const m = line.match(/^\/\/\s*(@[A-Za-z-]+)\s*(.*)$/);
    if (!m) continue;
    const [, key, value] = m;
    meta.set(key, [...(meta.get(key) ?? []), value.trim()]);
  }
  return meta;
}

/** 去掉元数据块后的代码体 */
function getCodeBody(source) {
  return source.replace(/\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/, '');
}

/**
 * 执行全部校验规则。
 * @param {string} source 脚本源码
 * @param {{ changelog?: string | null }} [options] changelog 内容，传 null 表示跳过版本一致性检查
 * @returns {{ errors: string[], warnings: string[], meta: Record<string, string[]> }}
 */
export function analyze(source, options = {}) {
  const errors = [];
  const warnings = [];

  const meta = parseMetaBlock(source);
  if (!meta) {
    return { errors: ['缺少 ==UserScript== 元数据块'], warnings, meta: {} };
  }

  // 1. 必需字段
  for (const field of REQUIRED_FIELDS) {
    if (!meta.has(field)) errors.push(`元数据缺少必需字段 ${field}`);
  }

  // 2. 版本号必须是 semver（Tampermonkey 依赖它判断是否需要更新）
  const version = meta.get('@version')?.[0];
  if (version && !SEMVER_RE.test(version)) {
    errors.push(`@version 不是合法的语义化版本号：${version}`);
  }

  // 3. @match 必须覆盖两个目标站点
  const matches = meta.get('@match') ?? [];
  for (const host of REQUIRED_MATCH_HOSTS) {
    if (!matches.some((m) => m.includes(host))) {
      errors.push(`@match 未覆盖 ${host}`);
    }
  }

  // 4. @grant 与代码实际使用的 GM_* API 必须一致
  //    漏声明 => 运行时 GM_* is not defined；多声明 => 权限过度申请
  const grants = new Set(meta.get('@grant') ?? []);
  const usedApis = new Set(getCodeBody(source).match(GM_API_RE) ?? []);
  for (const api of usedApis) {
    if (!grants.has(api)) errors.push(`代码使用了 ${api}，但 @grant 未声明（运行时会报 is not defined）`);
  }
  for (const grant of grants) {
    if (grant !== 'none' && grant.startsWith('GM_') && !usedApis.has(grant)) {
      warnings.push(`@grant 声明了 ${grant}，但代码中未使用`);
    }
  }

  // 5. 更新地址必须存在且为 https
  for (const field of ['@updateURL', '@downloadURL']) {
    const value = meta.get(field)?.[0];
    if (!value) {
      warnings.push(`缺少 ${field}，脚本将不会自动更新`);
    } else if (!value.startsWith('https://')) {
      errors.push(`${field} 必须使用 https：${value}`);
    }
  }

  // 6. 不允许遗留 debugger 语句
  if (DEBUGGER_RE.test(getCodeBody(source))) {
    errors.push('代码中存在 debugger 语句');
  }

  // 7. 隐私合规：脚本声称所有数据仅存本地，扫描是否存在第三方外链
  const externalUrls = new Set();
  for (const url of getCodeBody(source).match(ABSOLUTE_URL_RE) ?? []) {
    if (!URL_ALLOWLIST.some((host) => url.includes(host))) externalUrls.add(url);
  }
  for (const url of externalUrls) {
    warnings.push(`代码中出现第三方外链，请确认不会上传用户数据：${url}`);
  }

  // 8. 版本与 CHANGELOG 最新条目一致性
  if (options.changelog) {
    const latest = options.changelog.match(/^##\s*v?(\d+\.\d+\.\d+)/m)?.[1];
    if (latest && version && latest !== version) {
      warnings.push(`@version(${version}) 与 docs/CHANGELOG.md 最新版本(${latest})不一致`);
    }
  }

  const metaObject = Object.fromEntries([...meta.entries()].map(([k, v]) => [k, v.join(' | ')]));
  return { errors, warnings, meta: metaObject };
}

/** CLI 入口 */
function main() {
  const scriptPath = process.argv[2] ?? DEFAULT_SCRIPT_PATH;
  const resolved = path.resolve(scriptPath);

  if (!existsSync(resolved)) {
    console.error(`脚本文件不存在：${resolved}`);
    process.exit(1);
  }

  const source = readFileSync(resolved, 'utf8');
  const changelog = existsSync(CHANGELOG_PATH) ? readFileSync(CHANGELOG_PATH, 'utf8') : null;
  const { errors, warnings, meta } = analyze(source, { changelog });

  console.log(`校验 ${scriptPath}`);
  console.log(`  名称: ${meta['@name'] ?? '-'}`);
  console.log(`  版本: ${meta['@version'] ?? '-'}`);
  console.log(`  匹配: ${meta['@match'] ?? '-'}`);

  for (const w of warnings) console.warn(`  [警告] ${w}`);
  for (const e of errors) console.error(`  [错误] ${e}`);

  if (errors.length > 0) {
    console.error(`\n校验失败：${errors.length} 个错误`);
    process.exit(1);
  }
  console.log(`\n校验通过${warnings.length ? `（${warnings.length} 个警告）` : ''}`);
}

// 仅作为 CLI 直接运行时执行（被测试导入时不触发）
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}

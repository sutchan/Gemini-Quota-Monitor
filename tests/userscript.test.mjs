import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { analyze, parseMetaBlock, DEFAULT_SCRIPT_PATH, CHANGELOG_PATH } from '../scripts/validate-userscript.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, DEFAULT_SCRIPT_PATH);
const source = readFileSync(scriptPath, 'utf8');
const changelog = readFileSync(path.join(rootDir, CHANGELOG_PATH), 'utf8');
const result = analyze(source, { changelog });

test('用户脚本语法可被 Node 解析', () => {
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, ['--check', scriptPath], { stdio: 'pipe' });
  });
});

test('元数据块可被解析且必需字段齐全', () => {
  const meta = parseMetaBlock(source);
  assert.ok(meta, '未找到 ==UserScript== 元数据块');
  for (const field of ['@name', '@namespace', '@version', '@description', '@match']) {
    assert.ok(meta.has(field), `缺少 ${field}`);
  }
});

test('版本号为语义化版本', () => {
  const version = parseMetaBlock(source).get('@version')[0];
  assert.match(version, /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/);
});

test('@match 覆盖 AI Studio 与 Gemini Web', () => {
  const matches = parseMetaBlock(source).get('@match').join(' ');
  assert.match(matches, /aistudio\.google\.com/);
  assert.match(matches, /gemini\.google\.com/);
});

test('所有 GM_* API 均已 @grant 声明', () => {
  const grantErrors = result.errors.filter((e) => e.includes('@grant 未声明'));
  assert.deepEqual(grantErrors, [], grantErrors.join('\n'));
});

test('无遗留 debugger 语句', () => {
  assert.equal(result.errors.some((e) => e.includes('debugger')), false);
});

test('整体校验无错误', () => {
  assert.deepEqual(result.errors, [], result.errors.join('\n'));
});

test('校验器能识别缺失 @grant 的脚本', () => {
  const broken = source.replace(/\/\/ @grant\s+GM_setValue\s*\r?\n/, '');
  const { errors } = analyze(broken, {});
  assert.ok(
    errors.some((e) => e.includes('GM_setValue') && e.includes('@grant 未声明')),
    '校验器未能检测出缺失的 @grant 声明',
  );
});

test('校验器能识别 @match 缺失的脚本', () => {
  const broken = source.replace(/\/\/ @match\s+\*:\/\/gemini\.google\.com\/\*\s*\r?\n/, '');
  const { errors } = analyze(broken, {});
  assert.ok(
    errors.some((e) => e.includes('gemini.google.com')),
    '校验器未能检测出缺失的 @match',
  );
});

test('校验器能识别非法版本号', () => {
  const broken = source.replace(/\/\/ @version\s+2\.0\.0/, '// @version      v2.0');
  const { errors } = analyze(broken, {});
  assert.ok(
    errors.some((e) => e.includes('@version')),
    '校验器未能检测出非法版本号',
  );
});

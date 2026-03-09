// ==UserScript==
// @name         Google AI Studio 额度计数器 (UTC重置版)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  跨窗口统计 Gemini 免费额度，每日 UTC 00:00 自动重置
// @author       YourName
// @match        https://aistudio.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';

    // 配置项
    const DAILY_LIMIT = 1500; // 根据你的主要模型设置上限（如 Flash 是 1500 RPD）
    const STORAGE_KEY = "Gemini_Usage_UTC_Stats";

    // 获取当前的 UTC 日期字符串 (格式: 2026-03-09)
    function getUTCTodayStr() {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 获取或初始化统计数据
    function getStats() {
        const currentUTC = getUTCTodayStr();
        let stats = GM_getValue(STORAGE_KEY, { utcDate: currentUTC, count: 0 });

        // 如果存储的日期与当前 UTC 日期不符，说明已过 UTC 00:00，重置计数
        if (stats.utcDate !== currentUTC) {
            stats = { utcDate: currentUTC, count: 0 };
            GM_setValue(STORAGE_KEY, stats);
        }
        return stats;
    }

    // 创建进度条 UI
    const container = document.createElement('div');
    container.id = "gemini-quota-bar";
    container.style = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        background: rgba(32, 33, 36, 0.95); color: #e8eaed;
        padding: 12px; border-radius: 10px; border: 1px solid #5f6368;
        font-family: 'Google Sans', Roboto, sans-serif; font-size: 13px;
        width: 220px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
    `;
    document.body.appendChild(container);

    function updateUI(stats) {
        const percent = Math.min((stats.count / DAILY_LIMIT) * 100, 100).toFixed(1);
        const barColor = percent > 85 ? '#f28b82' : (percent > 50 ? '#fdd663' : '#8ab4f8');
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>今日用量 (UTC)</span>
                <span style="font-weight: bold;">${stats.count} / ${DAILY_LIMIT}</span>
            </div>
            <div style="width: 100%; background: #3c4043; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="width: ${percent}%; background: ${barColor}; height: 100%; transition: width 0.5s ease;"></div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #9aa0a6; text-align: right;">
                距离重置还有: ${getCountdownToUTC()}
            </div>
        `;
    }

    // 计算距离 UTC 00:00 还有多久
    function getCountdownToUTC() {
        const now = new Date();
        const nextUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
        const diff = nextUTC - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}小时${mins}分`;
    }

    // 监听跨窗口更新
    GM_addValueChangeListener(STORAGE_KEY, (name, old_val, new_val, remote) => {
        if (remote) updateUI(new_val);
    });

    // 拦截 API 请求
    const originFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originFetch(...args);
        
        // 匹配 AI Studio 的生成内容接口
        if (args[0] && args[0].includes('runStreamingGenerateContent') && response.ok) {
            let stats = getStats(); // 获取最新状态（包含日期检查）
            stats.count += 1;
            GM_setValue(STORAGE_KEY, stats);
            updateUI(stats);
        }
        return response;
    };

    // 每分钟定时刷新倒计时和重置状态
    setInterval(() => {
        updateUI(getStats());
    }, 60000);

    // 初始运行
    updateUI(getStats());
})();
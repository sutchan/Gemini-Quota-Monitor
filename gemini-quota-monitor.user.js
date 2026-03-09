// ==UserScript==
// @name         Gemini Quota Monitor
// @namespace    http://tampermonkey.net/gemini.quota.master
// @version      1.4
// @description  跨站（AI Studio & Gemini Web）实时监控免费额度，每日 UTC 00:00 自动重置
// @author       YourName
// @match        https://aistudio.google.com/*
// @match        https://gemini.google.com/*
// @updateURL    https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/gemini-quota-monitor.user.js
// @downloadURL  https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/gemini-quota-monitor.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';

    // --- 用户配置区 ---
    const DAILY_LIMIT = 1500; 
    const STORAGE_KEY = "Gemini_Universal_Usage_Stats";

    // --- 核心逻辑 ---

    // 获取 UTC 日期字符串 (YYYY-MM-DD)
    function getUTCTodayStr() {
        return new Date().toISOString().split('T')[0];
    }

    // 获取并校验数据
    function getStats() {
        const currentUTC = getUTCTodayStr();
        let stats = GM_getValue(STORAGE_KEY, { utcDate: currentUTC, count: 0 });
        
        if (stats.utcDate !== currentUTC) {
            stats = { utcDate: currentUTC, count: 0 };
            GM_setValue(STORAGE_KEY, stats);
        }
        return stats;
    }

    // --- UI 构建 ---
    const container = document.createElement('div');
    container.id = "gemini-quota-monitor-ui";
    container.style = `
        position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
        background: rgba(28, 29, 31, 0.85); color: #e8eaed;
        padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
        font-family: 'Google Sans', 'Segoe UI', Roboto, sans-serif; font-size: 13px;
        width: 190px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        pointer-events: none; transition: opacity 0.3s;
    `;
    document.body.appendChild(container);

    function updateUI(stats) {
        const percent = Math.min((stats.count / DAILY_LIMIT) * 100, 100).toFixed(1);
        const barColor = percent > 85 ? '#f28b82' : (percent > 50 ? '#fdd663' : '#81c995');
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 500;">
                <span style="opacity: 0.8;">Gemini 额度</span>
                <span>${stats.count} / ${DAILY_LIMIT}</span>
            </div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 5px; border-radius: 3px; overflow: hidden;">
                <div style="width: ${percent}%; background: ${barColor}; height: 100%; transition: width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);"></div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; opacity: 0.5; text-align: right;">
                UTC 00:00 重置
            </div>
        `;
    }

    // --- 数据同步与拦截 ---

    GM_addValueChangeListener(STORAGE_KEY, (name, old_val, new_val, remote) => {
        if (new_val) updateUI(new_val);
    });

    const originFetch = window.fetch;
    window.fetch = async (...args) => {
        const url = args[0]?.toString() || "";
        const response = await originFetch(...args);

        const isAIStep = url.includes('runStreamingGenerateContent');
        const isWebStep = url.includes('SendMessage') || url.includes('generate_content');

        if ((isAIStep || isWebStep) && response.ok) {
            let stats = getStats();
            stats.count += 1;
            GM_setValue(STORAGE_KEY, stats);
            updateUI(stats);
        }
        return response;
    };

    updateUI(getStats());
    setInterval(() => updateUI(getStats()), 30000);

})();
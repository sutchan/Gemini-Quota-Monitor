// ==UserScript==
// @name         Gemini Quota Master (Cross-Site)
// @namespace    http://tampermonkey.net/gemini.quota.master
// @version      1.2
// @description  跨窗口、跨域名（AI Studio & Gemini Web）同步统计免费额度，每日 UTC 00:00 自动重置
// @author       YourName
// @match        https://aistudio.google.com/*
// @match        https://gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';

    // --- 配置项 ---
    const DAILY_LIMIT = 1000; 
    const STORAGE_KEY = "Gemini_Universal_Usage_Stats";

    // 获取当前 UTC 日期 (YYYY-MM-DD)
    function getUTCTodayStr() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    // 获取/初始化统计数据
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
    container.id = "gemini-universal-quota-bar";
    // 适配两个站点的深浅色模式，采用半透明毛玻璃质感
    container.style = `
        position: fixed; bottom: 20px; left: 20px; z-index: 2147483647;
        background: rgba(30, 31, 32, 0.85); color: #e8eaed;
        padding: 10px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
        font-family: 'Google Sans', Arial, sans-serif; font-size: 12px;
        width: 180px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        backdrop-filter: blur(8px); pointer-events: none;
    `;
    document.body.appendChild(container);

    function updateUI(stats) {
        const percent = Math.min((stats.count / DAILY_LIMIT) * 100, 100).toFixed(1);
        const barColor = percent > 85 ? '#ff7063' : (percent > 50 ? '#fdd663' : '#81c995');
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; opacity: 0.9;">
                <span>Gemini 额度 (UTC)</span>
                <span style="font-weight: 600;">${stats.count}/${DAILY_LIMIT}</span>
            </div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                <div style="width: ${percent}%; background: ${barColor}; height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
            </div>
        `;
    }

    // --- 逻辑核心 ---

    // 1. 监听跨站/跨窗口更新
    GM_addValueChangeListener(STORAGE_KEY, (name, old_val, new_val, remote) => {
        updateUI(new_val);
    });

    // 2. 拦截请求 (适配不同域名的接口)
    const originFetch = window.fetch;
    window.fetch = async (...args) => {
        const url = args[0]?.toString() || "";
        const response = await originFetch(...args);

        // 判定规则：
        // AI Studio: runStreamingGenerateContent
        // Gemini Web: chat.google.com/u/0/_/ss/chat-app.pwa/GeminiService/SendMessage
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

    // 初始运行
    updateUI(getStats());
    
    // 自动置顶兼容 (防止被页面元素遮挡)
    setTimeout(() => { container.style.zIndex = "2147483647"; }, 2000);
})();
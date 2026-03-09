// ==UserScript==
// @name         Gemini Quota Monitor
// @namespace    http://tampermonkey.net/gemini.quota.monitor
// @version      1.6
// @description  跨站（AI Studio & Gemini Web）实时监控免费额度，每日 UTC 00:00 自动重置
// @author       Sut
// @match        https://aistudio.google.com/*
// @match        https://gemini.google.com/*
// @updateURL    https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/gemini-quota-monitor.user.js
// @downloadURL  https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/gemini-quota-monitor.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- 用户配置区 ---
    const DAILY_LIMIT = 1500; 
    const STORAGE_KEY = "Gemini_Universal_Usage_Stats";

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

    // --- UI 渲染引擎 ---
    function injectUI() {
        console.log("Gemini Quota Monitor: Attempting to inject UI...");
        if (document.getElementById("gemini-quota-monitor-ui")) {
            console.log("Gemini Quota Monitor: UI already exists.");
            return;
        }
        
        if (!document.body) {
            console.log("Gemini Quota Monitor: Body not ready, waiting...");
            setTimeout(injectUI, 500);
            return;
        }

        const container = document.createElement('div');
        container.id = "gemini-quota-monitor-ui";
        container.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            left: 30px !important;
            z-index: 2147483647 !important;
            background: rgba(28, 29, 31, 0.9) !important;
            color: #e8eaed !important;
            padding: 12px 16px !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            font-family: 'Google Sans', Roboto, sans-serif !important;
            font-size: 13px !important;
            width: 190px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            display: block !important;
            line-height: 1.4 !important;
            cursor: move !important;
            user-select: none !important;
        `;
        
        container.innerHTML = `
            <div id="gemini-quota-header" style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 8px !important;">
                <span style="opacity: 0.8 !important; font-size: 12px !important; pointer-events: none;">Gemini 额度</span>
                <button id="gemini-quota-collapse" style="background: none !important; border: none !important; color: white !important; cursor: pointer !important; font-size: 16px !important; padding: 0 4px !important;">−</button>
            </div>
            <div id="gemini-quota-body">
                <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important; align-items: center !important;">
                    <span id="gemini-quota-stats" style="font-weight: 600 !important; font-family: monospace !important;">0/0</span>
                </div>
                <div style="width: 100% !important; background: rgba(255,255,255,0.1) !important; height: 6px !important; border-radius: 3px !important; overflow: hidden !important; display: block !important;">
                    <div id="gemini-quota-bar" style="width: 0% !important; background: #81c995 !important; height: 100% !important; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;"></div>
                </div>
                <div style="margin-top: 6px !important; font-size: 10px !important; opacity: 0.5 !important; text-align: right !important;">
                    UTC 00:00 重置
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        console.log("Gemini Quota Monitor: UI appended to body.");

        // Drag functionality
        let isDragging = false;
        let offsetX, offsetY;
        container.addEventListener('mousedown', (e) => {
            if (e.target.id === 'gemini-quota-collapse') return;
            isDragging = true;
            offsetX = e.clientX - container.offsetLeft;
            offsetY = e.clientY - container.offsetTop;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            container.style.left = (e.clientX - offsetX) + 'px';
            container.style.top = (e.clientY - offsetY) + 'px';
            container.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => isDragging = false);

        // Collapse functionality
        const collapseBtn = document.getElementById('gemini-quota-collapse');
        const body = document.getElementById('gemini-quota-body');
        collapseBtn.addEventListener('click', () => {
            if (body.style.display === 'none') {
                body.style.display = 'block';
                collapseBtn.textContent = '−';
            } else {
                body.style.display = 'none';
                collapseBtn.textContent = '+';
            }
        });

        // Watch for removal
        const observer = new MutationObserver((mutations) => {
            if (!document.getElementById("gemini-quota-monitor-ui")) {
                console.log("Gemini Quota Monitor: UI removed, re-injecting...");
                injectUI();
            }
        });
        observer.observe(document.body, { childList: true });

        updateUI(getStats());
    }

    function updateUI(stats) {
        const statsEl = document.getElementById("gemini-quota-stats");
        const barEl = document.getElementById("gemini-quota-bar");
        if (!statsEl || !barEl) return;

        const percent = Math.min((stats.count / DAILY_LIMIT) * 100, 100).toFixed(1);
        const barColor = percent > 85 ? '#f28b82' : (percent > 50 ? '#fdd663' : '#81c995');
        
        statsEl.textContent = `${stats.count}/${DAILY_LIMIT}`;
        barEl.style.width = `${percent}%`;
        barEl.style.background = barColor;
    }

    // --- 监听逻辑 ---

    // 跨标签页数据同步
    GM_addValueChangeListener(STORAGE_KEY, (name, old_val, new_val, remote) => {
        if (new_val) updateUI(new_val);
    });

    // 拦截请求
    const originFetch = window.fetch;
    window.fetch = async (...args) => {
        const url = args[0]?.toString() || "";
        const response = await originFetch(...args);

        // 覆盖 AI Studio 和 Gemini Web 的关键接口
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

    // --- 启动序列 ---
    
    // 立即尝试加载
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        injectUI();
    } else {
        window.addEventListener('DOMContentLoaded', injectUI);
    }

    // 针对 Google 这种 SPA 页面，每秒检查一次 UI 是否被页面切换给刷掉了
    setInterval(() => {
        if (!document.getElementById("gemini-quota-monitor-ui")) {
            injectUI();
        }
    }, 1000);

    // 每 30 秒执行一次日期重置检查
    setInterval(() => updateUI(getStats()), 30000);

})();
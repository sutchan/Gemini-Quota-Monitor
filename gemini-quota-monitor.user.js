// ==UserScript==
// @name         Gemini Quota Monitor
// @namespace    http://tampermonkey.net/gemini.quota.monitor
// @version      1.7.0
// @description  跨站（AI Studio & Gemini Web）实时监控免费额度，每日 UTC 00:00 自动重置
// @author       Sut
// @match        *://aistudio.google.com/*
// @match        *://gemini.google.com/*
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
    const STORAGE_KEY = "Gemini_Universal_Usage_Stats";
    const SETTINGS_KEY = "Gemini_Monitor_Settings";

    function getSettings() {
        return GM_getValue(SETTINGS_KEY, { dailyLimit: 1500, debugMode: false });
    }

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
        if (document.getElementById("gemini-quota-monitor-ui")) return;
        
        if (!document.body) {
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
        
        // Header
        const header = document.createElement('div');
        header.id = "gemini-quota-header";
        header.style.cssText = `display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 8px !important;`;
        
        const title = document.createElement('span');
        title.textContent = "Gemini 额度";
        title.style.cssText = `opacity: 0.8 !important; font-size: 12px !important; pointer-events: none;`;
        
        const btnWrapper = document.createElement('div');
        
        const settingsBtn = document.createElement('button');
        settingsBtn.textContent = "⚙️";
        settingsBtn.style.cssText = `background: none !important; border: none !important; color: white !important; cursor: pointer !important; font-size: 12px !important; padding: 0 4px !important;`;
        settingsBtn.onclick = toggleSettings;
        
        const collapseBtn = document.createElement('button');
        collapseBtn.id = "gemini-quota-collapse";
        collapseBtn.textContent = "−";
        collapseBtn.style.cssText = `background: none !important; border: none !important; color: white !important; cursor: pointer !important; font-size: 16px !important; padding: 0 4px !important;`;
        
        btnWrapper.appendChild(settingsBtn);
        btnWrapper.appendChild(collapseBtn);
        header.appendChild(title);
        header.appendChild(btnWrapper);
        container.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.id = "gemini-quota-body";
        
        const statsWrapper = document.createElement('div');
        statsWrapper.style.cssText = `display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important; align-items: center !important;`;
        
        const stats = document.createElement('span');
        stats.id = "gemini-quota-stats";
        stats.style.cssText = `font-weight: 600 !important; font-family: monospace !important;`;
        stats.textContent = "0/0";
        
        statsWrapper.appendChild(stats);
        body.appendChild(statsWrapper);

        const barWrapper = document.createElement('div');
        barWrapper.style.cssText = `width: 100% !important; background: rgba(255,255,255,0.1) !important; height: 6px !important; border-radius: 3px !important; overflow: hidden !important; display: block !important;`;
        
        const bar = document.createElement('div');
        bar.id = "gemini-quota-bar";
        bar.style.cssText = `width: 0% !important; background: #81c995 !important; height: 100% !important; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;`;
        
        barWrapper.appendChild(bar);
        body.appendChild(barWrapper);

        const footer = document.createElement('div');
        footer.style.cssText = `margin-top: 6px !important; font-size: 10px !important; opacity: 0.5 !important; text-align: right !important;`;
        footer.textContent = "UTC 00:00 重置";
        body.appendChild(footer);
        
        container.appendChild(body);
        
        // Settings Panel
        const settingsPanel = document.createElement('div');
        settingsPanel.id = "gemini-quota-settings";
        settingsPanel.style.cssText = `display: none !important; margin-top: 10px !important; border-top: 1px solid rgba(255,255,255,0.1) !important; padding-top: 10px !important;`;
        
        const limitInput = document.createElement('input');
        limitInput.type = "number";
        limitInput.value = getSettings().dailyLimit;
        limitInput.style.cssText = `width: 60px !important; background: #333 !important; color: white !important; border: none !important; padding: 2px !important; border-radius: 4px !important;`;
        
        const debugToggle = document.createElement('input');
        debugToggle.type = "checkbox";
        debugToggle.checked = getSettings().debugMode;
        
        const limitLabel = document.createElement('div');
        limitLabel.textContent = "限额: ";
        limitLabel.style.cssText = `font-size: 11px !important; margin-bottom: 5px !important;`;
        
        const limitContainer = document.createElement('div');
        limitContainer.style.cssText = `margin-bottom: 5px !important;`;
        limitContainer.appendChild(limitInput);
        
        const debugLabel = document.createElement('div');
        debugLabel.textContent = "调试: ";
        debugLabel.style.cssText = `font-size: 11px !important;`;
        
        const debugContainer = document.createElement('div');
        debugContainer.appendChild(debugToggle);
        
        settingsPanel.appendChild(limitLabel);
        settingsPanel.appendChild(limitContainer);
        settingsPanel.appendChild(debugLabel);
        settingsPanel.appendChild(debugContainer);
        
        limitInput.onchange = (e) => {
            let s = getSettings();
            s.dailyLimit = parseInt(e.target.value);
            GM_setValue(SETTINGS_KEY, s);
            updateUI(getStats());
        };
        debugToggle.onchange = (e) => {
            let s = getSettings();
            s.debugMode = e.target.checked;
            GM_setValue(SETTINGS_KEY, s);
        };
        
        container.appendChild(settingsPanel);
        
        document.body.appendChild(container);

        // Drag functionality
        let isDragging = false;
        let offsetX, offsetY;
        container.addEventListener('mousedown', (e) => {
            if (e.target.id === 'gemini-quota-collapse' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
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
                injectUI();
            }
        });
        observer.observe(document.body, { childList: true });

        updateUI(getStats());
    }

    function toggleSettings() {
        const panel = document.getElementById("gemini-quota-settings");
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    function updateUI(stats) {
        const statsEl = document.getElementById("gemini-quota-stats");
        const barEl = document.getElementById("gemini-quota-bar");
        if (!statsEl || !barEl) return;

        const limit = getSettings().dailyLimit;
        const percent = Math.min((stats.count / limit) * 100, 100).toFixed(1);
        const barColor = percent > 85 ? '#f28b82' : (percent > 50 ? '#fdd663' : '#81c995');
        
        statsEl.textContent = `${stats.count}/${limit}`;
        barEl.style.width = `${percent}%`;
        barEl.style.background = barColor;
    }

    // --- 监听逻辑 ---
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
            if (getSettings().debugMode) console.log("Gemini Monitor: Request detected", url);
            let stats = getStats();
            stats.count += 1;
            GM_setValue(STORAGE_KEY, stats);
            updateUI(stats);
        }
        return response;
    };

    // --- 启动序列 ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        injectUI();
    } else {
        window.addEventListener('DOMContentLoaded', injectUI);
    }

    setInterval(() => {
        if (!document.getElementById("gemini-quota-monitor-ui")) {
            injectUI();
        }
    }, 1000);

    setInterval(() => updateUI(getStats()), 30000);

})();
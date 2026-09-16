// ==UserScript==
// @name         Gemini Quota Monitor
// @namespace    http://tampermonkey.net/gemini.quota.monitor
// @version      2.0.0
// @description  跨站（AI Studio & Gemini Web）实时监控免费额度，每日 UTC 00:00 自动重置。使用 Shadow DOM 确保 UI 在复杂站点下的可见性。
// @author       Sut
// @match        *://aistudio.google.com/*
// @match        *://gemini.google.com/*
// @updateURL    https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/src/scripts/gemini-quota-monitor.user.js
// @downloadURL  https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/src/scripts/gemini-quota-monitor.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const DEBUG_PREFIX = "[Gemini Monitor]";
    console.log(`${DEBUG_PREFIX} Script initializing...`);

    // --- Config & State ---
    const STORAGE_KEY = "Gemini_Universal_Usage_Stats";
    const SETTINGS_KEY = "Gemini_Monitor_Settings";
    const MODEL_LIMITS = {
        "gemini-1.5-flash": 1500,
        "gemini-1.5-pro": 50,
        "gemini-2.0-flash": 1500,
        "gemini-2.0-flash-lite": 1500,
        "gemini-2.0-pro-exp": 50,
        "gemini-3-pro": 50,
        "gemini-3-flash": 1500,
        "gemini-3.1-pro": 50,
        "gemini-3.1-flash-lite": 1500
    };

    function getSettings() {
        return GM_getValue(SETTINGS_KEY, { selectedModel: "gemini-1.5-flash", dailyLimit: 1500, debugMode: false });
    }

    function getUTCTodayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function getStats() {
        const currentUTC = getUTCTodayStr();
        let stats = GM_getValue(STORAGE_KEY, { utcDate: currentUTC, count: 0, errorCount: 0 });
        
        if (stats.utcDate !== currentUTC) {
            stats = { utcDate: currentUTC, count: 0, errorCount: 0 };
            GM_setValue(STORAGE_KEY, stats);
        }
        return stats;
    }

    function log(...args) {
        if (getSettings().debugMode) {
            console.log(DEBUG_PREFIX, ...args);
        }
    }

    // --- UI Engine (Shadow DOM) ---
    let shadow = null;
    let host = null;

    function injectUI() {
        // 检查是否已存在
        if (document.getElementById("gemini-quota-monitor-host")) {
            // 确保它在顶层且可见
            const existing = document.getElementById("gemini-quota-monitor-host");
            if (existing.parentElement !== document.documentElement && existing.parentElement !== document.body) {
                log("Host in wrong place, moving to documentElement");
                document.documentElement.appendChild(existing);
            }
            return;
        }
        
        // 优先选择 documentElement 以避免 body 样式干扰或未加载
        const container = document.documentElement;
        if (!container) {
            setTimeout(injectUI, 50);
            return;
        }

        host = document.createElement('div');
        host.id = "gemini-quota-monitor-host";
        // 极其重要的样式确保：固定位置、最高层级、不被裁剪、允许交互
        host.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            left: 30px !important;
            z-index: 2147483647 !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            isolation: isolate !important;
        `;
        
        shadow = host.attachShadow({ mode: 'open' });
        
        const style = document.createElement('style');
        style.textContent = `
            :host {
                all: initial; /* 彻底切断外部 CSS 继承 */
                display: block;
            }
            #ui-card {
                background: rgba(28, 29, 31, 0.95);
                color: #e8eaed;
                padding: 12px 16px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.2);
                font-family: 'Google Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 13px;
                width: 200px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                line-height: 1.4;
                cursor: move;
                user-select: none;
                transition: opacity 0.3s, transform 0.2s;
            }
            #ui-card:hover { transform: translateY(-2px); }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; }
            .title { opacity: 0.9; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: #8ab4f8; }
            .controls { display: flex; gap: 4px; }
            .controls button { background: rgba(255,255,255,0.05); border: none; color: white; cursor: pointer; font-size: 12px; padding: 2px 6px; border-radius: 4px; transition: background 0.2s; }
            .controls button:hover { background: rgba(255,255,255,0.15); }
            .stats-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 12px; }
            .ring-container { width: 32px; height: 32px; flex-shrink: 0; position: relative; }
            .circular-chart { display: block; width: 100%; height: 100%; }
            .circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 3.8; }
            .circle { fill: none; stroke-width: 3.8; stroke-linecap: round; transition: stroke-dasharray 0.8s ease, stroke 0.3s; }
            .stats-info { flex-grow: 1; display: flex; flex-direction: column; align-items: flex-end; }
            .stats-value { font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace; font-weight: 700; font-size: 16px; color: #fff; line-height: 1; }
            .progress-bg { width: 100%; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); display: none; /* 隐藏原本的横向进度条 */ }
            .progress-bar { width: 0%; height: 100%; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s; }
            .footer { font-size: 9px; opacity: 0.5; text-align: right; margin-top: 6px; font-style: italic; }
            .settings-panel { display: none; margin-top: 12px; padding-top: 10px; }
            .settings-panel label { display: block; font-size: 10px; margin-bottom: 4px; opacity: 0.8; font-weight: 600; color: #8ab4f8; }
            .settings-panel select, .settings-panel input[type="number"] {
                width: 100%; background: #202124; color: #fff; border: 1px solid #3c4043; border-radius: 6px; padding: 4px 8px; font-size: 11px; margin-bottom: 10px; outline: none;
            }
            .settings-panel select:focus, .settings-panel input:focus { border-color: #8ab4f8; }
            .error-badge { background: #ea4335; color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: bold; margin-left: 6px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        `;
        
        const card = document.createElement('div');
        card.id = "ui-card";
        card.innerHTML = `
            <div class="header">
                <span class="title">QUOTA MONITOR</span>
                <div class="controls">
                    <button id="btn-settings" title="Settings">SET</button>
                    <button id="btn-collapse" title="Collapse">MIN</button>
                </div>
            </div>
            <div id="ui-body">
                <div class="stats-row">
                    <div class="ring-container">
                        <svg viewBox="0 0 36 36" class="circular-chart">
                            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path id="ring-progress" class="circle" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                    </div>
                    <div class="stats-info">
                        <span id="text-count" class="stats-value">0/0</span>
                        <span id="badge-error" class="error-badge" style="display:none; margin-top: 4px;">ERR:0</span>
                    </div>
                </div>
                <div class="progress-bg">
                    <div id="bar-progress" class="progress-bar"></div>
                </div>
                <div class="footer">Reset UTC 00:00</div>
            </div>
            <div id="panel-settings" class="settings-panel">
                <label>MODEL SELECT</label>
                <select id="select-model">
                    ${Object.keys(MODEL_LIMITS).map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
                <label>DAILY LIMIT</label>
                <input id="input-limit" type="number">
                <div style="display:flex; align-items:center; margin-top:4px;">
                    <input id="check-debug" type="checkbox" id="dbg-chk">
                    <label for="dbg-chk" style="margin:0 0 0 8px; cursor:pointer; font-size:10px;">DEBUG LOGS</label>
                </div>
            </div>
        `;
        
        shadow.appendChild(style);
        shadow.appendChild(card);
        container.appendChild(host);

        // --- Bind UI Events ---
        const $ = (id) => shadow.getElementById(id);
        
        $('btn-settings').onclick = (e) => {
            e.stopPropagation();
            const p = $('panel-settings');
            p.style.display = p.style.display === 'block' ? 'none' : 'block';
        };

        $('btn-collapse').onclick = (e) => {
            e.stopPropagation();
            const b = $('ui-body');
            const p = $('panel-settings');
            if (b.style.display === 'none') {
                b.style.display = 'block';
                $('btn-collapse').textContent = 'MIN';
            } else {
                b.style.display = 'none';
                p.style.display = 'none';
                $('btn-collapse').textContent = 'MAX';
            }
        };

        const modelSelect = $('select-model');
        const limitInput = $('input-limit');
        const debugCheck = $('check-debug');

        const settings = getSettings();
        modelSelect.value = settings.selectedModel;
        limitInput.value = settings.dailyLimit;
        debugCheck.checked = settings.debugMode;

        modelSelect.onchange = () => {
            const s = getSettings();
            s.selectedModel = modelSelect.value;
            s.dailyLimit = MODEL_LIMITS[modelSelect.value];
            limitInput.value = s.dailyLimit;
            GM_setValue(SETTINGS_KEY, s);
            updateUI(getStats());
        };

        limitInput.onchange = () => {
            const s = getSettings();
            s.dailyLimit = parseInt(limitInput.value) || 0;
            GM_setValue(SETTINGS_KEY, s);
            updateUI(getStats());
        };

        debugCheck.onchange = () => {
            const s = getSettings();
            s.debugMode = debugCheck.checked;
            GM_setValue(SETTINGS_KEY, s);
        };

        // --- Drag ---
        let dragging = false, oX, oY;
        card.onmousedown = (e) => {
            if (['BUTTON', 'INPUT', 'SELECT', 'OPTION', 'LABEL'].includes(e.target.tagName)) return;
            dragging = true;
            oX = e.clientX - host.offsetLeft;
            oY = e.clientY - host.offsetTop;
            card.style.opacity = "0.8";
            card.style.transform = "scale(0.98)";
        };
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            host.style.left = (e.clientX - oX) + 'px';
            host.style.top = (e.clientY - oY) + 'px';
            host.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            if (card) {
                card.style.opacity = "1";
                card.style.transform = "none";
            }
        });

        updateUI(getStats());
        log("UI Re-injected & Isolated");
    }

    function updateUI(stats) {
        if (!shadow) return;
        const countText = shadow.getElementById('text-count');
        const bar = shadow.getElementById('bar-progress');
        const ring = shadow.getElementById('ring-progress');
        const errBadge = shadow.getElementById('badge-error');
        if (!countText) return;

        const limit = getSettings().dailyLimit;
        const count = stats.count || 0;
        const errs = stats.errorCount || 0;

        countText.textContent = `${count}/${limit}`;
        
        const percent = Math.min((count / limit) * 100, 100);
        
        // 更新横向进度条（如果未完全移除）
        if (bar) bar.style.width = `${percent}%`;
        
        // 更新圆环进度条
        if (ring) ring.setAttribute('stroke-dasharray', `${percent}, 100`);

        const color = percent > 85 ? '#ea4335' : (percent > 50 ? '#fbbc04' : '#34a853');
        
        if (bar) bar.style.background = color;
        if (ring) ring.style.stroke = color;

        if (errs > 0) {
            errBadge.style.display = 'inline-block';
            errBadge.textContent = `ERR:${errs}`;
        } else {
            errBadge.style.display = 'none';
        }
    }

    // --- Interception Core ---

    function handleActivity(status) {
        let stats = getStats();
        if (status === 200) {
            stats.count += 1;
            log("Success tracked. Total:", stats.count);
        } else if (status === 429) {
            stats.errorCount += 1;
            log("Rate limit detected. Total errors:", stats.errorCount);
        } else {
            return;
        }

        GM_setValue(STORAGE_KEY, stats);
        updateUI(stats);
    }

    // XHR Interception
    const rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this._monitorUrl = url ? url.toString() : "";
        return rawOpen.apply(this, arguments);
    };

    const rawSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', () => {
            const url = this._monitorUrl || "";
            if (url.includes('GenerateContent') || url.includes('SendMessage') || url.includes('generate_content')) {
                log("XHR Activity Detected", url, this.status);
                handleActivity(this.status);
            }
        });
        return rawSend.apply(this, arguments);
    };

    // Fetch Interception
    const rawFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0]?.toString() || "";
        try {
            const response = await rawFetch.apply(this, args);
            if (url.includes('GenerateContent') || url.includes('SendMessage') || url.includes('generate_content')) {
                log("Fetch Activity Detected", url, response.status);
                handleActivity(response.status);
            }
            return response;
        } catch (err) {
            throw err;
        }
    };

    // --- Initialization & Lifecycle ---
    GM_addValueChangeListener(STORAGE_KEY, (n, ov, nv) => {
        if (nv) updateUI(nv);
    });

    // 监控页面变化，确保宿主元素不被移除或移动
    const observer = new MutationObserver(() => {
        if (!document.getElementById("gemini-quota-monitor-host")) {
            injectUI();
        }
    });

    const startApp = () => {
        injectUI();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }

    window.addEventListener('load', injectUI);

    // 双重保障
    setInterval(injectUI, 5000);

    log("Monitor Core V2.1 initialized (Persistence Mode)");
})();

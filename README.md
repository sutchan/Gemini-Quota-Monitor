# Gemini Quota Monitor

A Tampermonkey user script designed to track and display the usage of Gemini's free tier quota across different Google domains (AI Studio and Gemini Web).

[简体中文](README_CN.md)

## Features
- **Cross-Site Tracking**: Monitors requests on both `aistudio.google.com` and `gemini.google.com`.
- **Real-time Synchronization**: Synchronizes usage data across multiple open browser tabs/windows.
- **Automatic Reset**: Automatically resets the usage counter at UTC 00:00 daily.
- **Interactive UI**: Floating, high-priority UI with drag-to-move and collapse functionality.

## Installation & Troubleshooting
1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Click the link below to install the script directly:
   [**Install Gemini Quota Monitor**](https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/src/scripts/gemini-quota-monitor.user.js)

### If tracking fails:
- Enable "Debug Mode" in the script's settings panel.
- Open your browser's Developer Tools (F12) and check the "Console" tab for "Potential request ignored" logs.
- This will help identify the new API path, allowing you to adjust the matching logic in the script.

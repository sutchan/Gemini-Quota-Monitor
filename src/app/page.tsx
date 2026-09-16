'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  Download, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Layout,
  Plus
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#1a1a1a] dark:text-[#e8eaed] selection:bg-blue-100 dark:selection:bg-blue-900/30 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Gemini Quota Monitor</span>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <a 
              href="https://github.com/sutchan/Gemini-Quota-Monitor" 
              target="_blank" 
              className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-[#1a1a1a] to-[#4a4a4a] dark:from-white dark:to-[#888] bg-clip-text text-transparent">
              掌控每一额度，<br />释放 AI 潜能
            </h1>
            <p className="text-xl md:text-2xl text-[#666] dark:text-[#999] max-w-2xl mx-auto mb-10 leading-relaxed">
              实时监控 Gemini 免费额度。支持 AI Studio 与 Gemini Web 跨站同步、历史趋势分析及自动模型发现。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a 
              href="https://github.com/sutchan/Gemini-Quota-Monitor/raw/refs/heads/main/src/scripts/gemini-quota-monitor.user.js"
              className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-2 overflow-hidden"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              立即安装脚本
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <a 
              href="https://aistudio.google.com/"
              target="_blank"
              className="px-8 py-4 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-full font-semibold text-lg transition-all flex items-center gap-2"
            >
              前往 AI Studio
              <ChevronRight className="w-5 h-5 opacity-40" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-black/2 dark:bg-white/2 border-y border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
              title="跨站实时监测"
              description="无缝衔接 AI Studio 与 Gemini Web 终端，所有模型调用请求将被精准捕获并实时同步。"
            />
            <FeatureCard 
              icon={<RefreshCw className="w-6 h-6 text-blue-500" />}
              title="自动模型发现"
              description="新模型发布无需更新脚本，系统将根据 API 请求自动识别并同步最新的模型清单及限额。"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-amber-500" />}
              title="7天趋势追踪"
              description="集成历史记录面板，自动保存每日使用量，帮您直观分析 AI 使用频率与习惯。"
            />
            <FeatureCard 
              icon={<Layout className="w-6 h-6 text-purple-500" />}
              title="Shadow DOM 隔离"
              description="采用最高优先级的 UI 隔离技术，确保监视窗口永远浮于顶层，不受原站样式干扰。"
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-cyan-500" />}
              title="轻量高性能"
              description="纯原生 JS 逻辑编写，内存占用极低，毫秒级响应，不影响网页加载与运行速度。"
            />
            <FeatureCard 
              icon={<Monitor className="w-6 h-6 text-rose-500" />}
              title="每日自动重置"
              description="严格遵循 Google API 重置规则，每日 UTC 00:00 自动清零，让您每一天都从头开始。"
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">为什么选择我们？</h2>
          <div className="overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0d0d0d] shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5">
                  <th className="p-6 font-bold">特性</th>
                  <th className="p-6 font-bold text-blue-600 dark:text-blue-400">Gemini Monitor</th>
                  <th className="p-6 font-bold opacity-40">常规方法</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                <tr>
                  <td className="p-6 font-medium">监测方式</td>
                  <td className="p-6">全自动化拦截 (XHR/Fetch)</td>
                  <td className="p-6 opacity-40">手动估算次数</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">模型更新</td>
                  <td className="p-6">动态发现 & 实时同步</td>
                  <td className="p-6 opacity-40">需手动查找列表</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">UI 隔离</td>
                  <td className="p-6">Shadow DOM (零样式污染)</td>
                  <td className="p-6 opacity-40">易受站点样式干扰</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">数据分析</td>
                  <td className="p-6">7天历史趋势 & AVG 统计</td>
                  <td className="p-6 opacity-40">无历史记录</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#fafafa] dark:bg-[#050505] border-t border-black/5 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center">常见问题解答</h2>
          <div className="space-y-6">
            <FAQItem 
              question="脚本会收集我的个人数据吗？"
              answer="绝对不会。所有监测数据（请求次数、模型名称、历史记录）均仅保存在您本地浏览器的 localStorage 中，没有任何后端服务器上传或外泄行为。"
            />
            <FAQItem 
              question="如果在多个标签页同时对话，计数会同步吗？"
              answer="是的。脚本使用了跨标签页监听机制 (GM_addValueChangeListener)，当您在一个标签页产生请求时，所有开启了监测的标签页都会实时同步更新计数。"
            />
            <FAQItem 
              question="如何支持新发布的模型（如 Gemini 3.5）？"
              answer="脚本具备“动态模型发现”功能。只要 API 路径中包含模型标识符，系统会自动识别并同步到您的下拉菜单中，无需等待脚本更新。"
            />
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-16 text-center">三步开启监控之旅</h2>
          <div className="space-y-12">
            <Step 
              number="01"
              title="准备运行环境"
              description="在浏览器中安装 Tampermonkey（油猴）扩展程序。它是脚本运行的基础载体。"
              link="https://www.tampermonkey.net/"
              linkText="下载 Tampermonkey"
            />
            <Step 
              number="02"
              title="一键安装脚本"
              description="点击上方的“立即安装”按钮。在弹出的 Tampermonkey 页面中点击安装确认。"
            />
            <Step 
              number="03"
              title="即刻开始对话"
              description="访问 Google AI Studio 或 Gemini Web。你会发现左下角出现了一个优雅的监视浮窗。"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/5 dark:border-white/5 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 text-sm">
          <span>&copy; 2026 Gemini Quota Monitor. 由 Sut 匠心打造。</span>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-blue-500 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-blue-500 transition-colors">更新日志</a>
            <a href="https://github.com/sutchan/Gemini-Quota-Monitor" target="_blank" className="hover:text-blue-500 transition-colors">开源协议</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-black/5 dark:border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold group-hover:text-blue-500 transition-colors">{question}</span>
        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-500' : 'opacity-40'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-[#666] dark:text-[#999] leading-relaxed italic">{answer}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[#666] dark:text-[#999] leading-relaxed italic line-clamp-3">
        {description}
      </p>
    </div>
  );
}

function Step({ number, title, description, link, linkText }: { number: string, title: string, description: string, link?: string, linkText?: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="text-5xl font-black text-black/5 dark:text-white/5 group-hover:text-blue-500/20 transition-colors duration-500">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-[#666] dark:text-[#999] text-lg leading-relaxed mb-4">
          {description}
        </p>
        {link && (
          <a href={link} target="_blank" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
            {linkText} <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/** @type {import('next').NextConfig} */

// 静态导出仅在部署流程中开启（NEXT_STATIC_EXPORT=true），
// 这样本地 `npm run dev` / `npm start` 行为保持原有服务端模式不变。
const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';

// 部署到 GitHub Pages 项目站点时需要子路径；仓库名作为默认 basePath。
// 本地或自定义域名部署可用 NEXT_PUBLIC_BASE_PATH 覆盖（置空则不启用）。
const defaultBasePath = process.env.GITHUB_ACTIONS === 'true' ? '/Gemini-Quota-Monitor' : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isStaticExport ? defaultBasePath : '');

const nextConfig = {
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  // 静态导出模式下必须关闭图片优化
  images: { unoptimized: true },
  ...(isStaticExport
    ? {
        output: 'export',
        // GitHub Pages 不支持动态路由回退，开启后每个路由输出 index.html
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;

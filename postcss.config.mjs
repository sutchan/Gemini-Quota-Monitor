/** Tailwind CSS v4 使用独立 PostCSS 插件，必须显式声明，否则 next build 会失败。 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;

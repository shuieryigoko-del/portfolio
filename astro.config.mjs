import { defineConfig } from 'astro/config';

// 纯静态输出。构建命令：npm run build，产物目录：dist。
export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});

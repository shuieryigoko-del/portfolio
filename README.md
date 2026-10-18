# 万千重复昵称 · 作品集

一个杂志编辑风格的个人作品集：文字 + 图片组成一篇作品，公开链接直接访问，只有你能在网页后台发布。

- 站点框架：Astro（纯静态）
- 内容后台：Pages CMS（浏览器里填表、拖图上传）
- 代码与内容仓库：GitHub
- 部署：Cloudflare Pages（免费）
- 日常发布不需要安装 Git、Node，也不需要命令行

## 目录结构

```
src/
  content/
    works/          每篇作品一个 Markdown 文件（由 Pages CMS 自动生成）
    pages/about.md  关于页
  pages/            首页、作品页、关于页、404
  components/       页头、页脚、作品卡片
  layouts/          全站 HTML 骨架、SEO、图片灯箱
  lib/site.ts       站点名称、简介、邮箱、域名
  lib/works.ts      日期、排序、阅读时长等工具函数
  styles/global.css 全部样式
public/
  uploads/          上传的图片
  favicon.svg
.pages.yml          Pages CMS 的后台配置（中文表单）
tests/              单元测试
```

## 本地开发（维护者用）

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # 单元测试
npm run build    # 生成 dist/
```

需要 Node.js 22。

## 第一次上线

### 1. 代码已经推到 GitHub

仓库：`https://github.com/shuieryigoko-del/portfolio`

### 2. 连接 Cloudflare Pages

1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择 GitHub 账号，授权并选中 `portfolio` 仓库
4. 构建设置：
   - Framework preset：**Astro**
   - Build command：`npm run build`
   - Build output directory：`dist`
   - Root directory：`/`
5. 环境变量（Production 和 Preview 都加）：
   - `NODE_VERSION` = `22`
6. 点 **Save and Deploy**，等 1~2 分钟
7. 记下分配到的地址，形如 `https://portfolio-xxxx.pages.dev`

### 3. 把正式域名写进站点

打开 `src/lib/site.ts`，把 `url` 改成刚拿到的地址：

```ts
url: 'https://portfolio-xxxx.pages.dev',
```

提交并推送后，Cloudflare 会自动重新构建。这一步用于 canonical 链接和微信/社交平台的分享卡片。

### 4. 打开 Pages CMS 后台

1. 打开 [app.pagescms.org](https://app.pagescms.org)
2. 点 **Sign in with GitHub**，用 `shuieryigoko-del` 登录
3. 安装 GitHub App，仓库权限选 **Only select repositories** → `portfolio`
4. 回到 Pages CMS，选择 `portfolio` 仓库
5. 左侧应该能看到「作品」和「关于页」两个菜单

`.pages.yml` 已经配置好中文字段，不需要再设置。

## 日常发作品：5 步

1. 打开 `app.pagescms.org`，选 `portfolio`
2. 左侧点 **作品** → **New**（新建）
3. 填：标题、网址后缀、日期、摘要
4. 点「封面图」上传封面；正文里直接写，图片拖进编辑器或点图片按钮上传
5. 点 **Save**，等 1~2 分钟，刷新网站

保存时 Pages CMS 会直接提交到 GitHub 的 `main` 分支，Cloudflare Pages 检测到更新后自动构建。不需要你手动发布。

### 字段怎么填

| 字段 | 必填 | 说明 |
|---|---|---|
| 标题 | 是 | 作品名，会显示在首页和详情页 |
| 网址后缀 | 是 | 英文小写、数字、连字符，例如 `three-cups`。发布后不要改，否则旧链接会失效 |
| 日期 | 是 | 用于排序和显示，新的在前 |
| 摘要 | 是 | 一句话，显示在首页列表和分享卡片上 |
| 封面图 | 否 | 建议竖图 4:5；没有封面会显示一个文字占位块 |
| 封面说明 | 否 | 一句话描述封面，利于无障碍和搜索 |
| 标签 | 否 | 按回车逐个添加，例如「静物」「日常」 |
| 草稿 | 否 | 打开后不生成页面、不出现在首页；写完关掉再保存 |
| 正文 | 是 | 富文本编辑器，支持标题、引用、列表、图片 |

### 关于页

左侧「关于页」直接改标题、简介和正文，保存即可。

## 图片建议

- 封面：竖图 **4:5**，建议 1200×1500 或 1600×2000
- 正文配图：横图 **3:2 / 4:3**，长边 1600~2000px
- 单张控制在 **200~500KB**，不要直接传手机原图（5~10MB）
- 格式用 JPG 或 WebP；iPhone 的 HEIC 先在相册里导出成 JPG
- 图片会自动存到 `public/uploads/`，正文里的路径由后台自动写入，不用手写

图片多了以后，可以再把图片迁到对象存储/图床；目前这个量级放仓库里最简单，也方便回滚。

## 常见问题

**保存后网站没变化？**
先等 2 分钟。还没变就去 Cloudflare 的 **Deployments** 看最新一次构建是否失败。

**构建失败？**
最常见的原因是「网址后缀」不符合规则。只能用小写英文、数字、连字符，例如 `my-first-work`。改正后重新保存。

**图片不显示？**
确认图片是通过后台上传的（不要手写外部路径）。如果从别处粘贴了图片链接，删掉重新上传。

**不小心删了作品？**
GitHub 仓库的提交历史里还能找回；也可以在 Cloudflare 的部署历史里看到旧版本。不要慌，先别继续改。

**草稿会被人看到吗？**
不会。草稿不会生成页面，也不在首页列表里。但请注意：仓库是公开的，源文件本身能看到。真正私密的内容不要放进来。

**谁能修改网站？**
只有对 GitHub 仓库有写权限的账号。公开页面是纯静态的，任何人拿到链接都能看，不需要登录。

**链接可以改吗？**
可以，但不建议。改了「网址后缀」等于换了一个网址，之前分享出去的链接会 404。

## 安全提醒

- 给 GitHub 账号开两步验证
- Pages CMS 安装 GitHub App 时只授权 `portfolio` 这一个仓库
- 不要把密码、Token、验证码发给任何人
- 仓库里不要放密钥；这个站点不需要任何环境变量密钥

## 想改样式/加功能

- 站点名称、简介、邮箱、社交链接：`src/lib/site.ts`
- 颜色、字号、间距：`src/styles/global.css` 顶部的 `:root` 变量
- 页面结构：`src/pages/`
- 后台字段：`.pages.yml`

改完运行 `npm test && npm run build`，通过后提交即可。

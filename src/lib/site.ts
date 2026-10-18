export interface SocialLink {
  label: string;
  href: string;
}

/**
 * 站点信息。改名字、简介、邮箱、域名，都在这里。
 * url 在部署完成后填入（例如 https://portfolio.pages.dev），用于 canonical 和分享卡片。
 */
export const SITE = {
  title: '万千重复昵称',
  tagline: '一些物质',
  description: '万千重复昵称的作品集：一些物质，以及它们留下的痕迹。',
  intro: '这里放一些物质，以及它们留下的痕迹。照片、短文，和偶尔的笔记。',
  author: '万千重复昵称',
  email: 'shuieryigoko@gmail.com',
  url: '',
  locale: 'zh-CN',
  startYear: 2026,
  social: [] as SocialLink[],
};

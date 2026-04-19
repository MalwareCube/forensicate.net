export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface GiscusConfig {
  enabled: boolean;
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
}

export const site = {
  title: 'forensicate.net',
  tagline: 'notes from the trenches',
  description:
    'A personal DFIR blog by Andrew Prince. Notes, research, and lessons learned from a career spent chasing adversaries.',
  author: 'Andrew Prince',
  url: 'https://forensicate.net',
  lang: 'en',
  postsPerPage: 10,
  sidebarRecentCount: 8,
};

export const nav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Posts', href: '/posts/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Media', href: '/media/' },
  { label: 'About', href: '/about/' },
];

export const postsSubNav: NavLink[] = [
  { label: 'All posts', href: '/posts/' },
  { label: 'Categories', href: '/categories/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'Archive', href: '/archive/' },
];

export const socials: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andrewjoeprince/' },
  { label: 'GitHub', href: 'https://github.com/malwarecube' },
  { label: 'YouTube', href: 'https://www.youtube.com/@MalwareCube' }
];

export const sidebarTagLimit = 15;

// See https://giscus.app to generate the IDs.
export const giscus: GiscusConfig = {
  enabled: false,
  repo: 'malwarecube/forensicate',
  repoId: 'REPLACE_WITH_REPO_ID',
  category: 'Comments',
  categoryId: 'REPLACE_WITH_CATEGORY_ID',
};

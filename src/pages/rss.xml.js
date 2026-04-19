import rss from '@astrojs/rss';
import { site } from '../site.config.ts';
import { getAllPosts, postPath } from '../lib/posts.ts';

export async function GET(context) {
  const posts = await getAllPosts();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? '',
      pubDate: post.data.pubDate,
      link: postPath(post),
      categories: post.data.tags,
      author: site.author,
    })),
    customData: `<language>${site.lang}</language>`,
  });
}

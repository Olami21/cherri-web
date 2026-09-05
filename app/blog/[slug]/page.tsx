import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity/client';
import { urlFor } from '@/lib/sanity/image';
import { POST_BY_SLUG_QUERY } from '@/lib/sanity/queries';

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug });

  if (!post) {
    return (
      <main className="blog-post-wrap">
        <p className="summary-hint">Post not found.</p>
      </main>
    );
  }

  return (
    <main className="blog-post-wrap">
      {post.coverImage && (
        <div className="blog-post-cover">
          <img src={urlFor(post.coverImage).width(1200).url()} alt={post.title} />
        </div>
      )}

      <div className="wrap blog-post-content">
        {post.category && <span className="blog-card-category">{post.category}</span>}
        <h1 className="section-title size-l">{post.title}</h1>
        <p className="blog-post-date">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div className="blog-post-body">
          <PortableText value={post.body} />
        </div>
      </div>
    </main>
  );
}
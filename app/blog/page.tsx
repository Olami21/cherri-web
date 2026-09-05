import Link from 'next/link';
import { client } from '@/lib/sanity/client';
import { urlFor } from '@/lib/sanity/image';
import { POSTS_QUERY } from '@/lib/sanity/queries';

export const revalidate = 60;

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  category?: string;
  coverImage?: any;
  publishedAt: string;
};

export default async function BlogPage() {
  const posts: Post[] = await client.fetch(POSTS_QUERY);

  return (
    <main className="blog-wrap">
      <section className="blog-hero">
        <div className="wrap">
          <h1 className="section-title size-l">The Wellness Hub</h1>
          <p className="section-desc">
            Practical guidance on nutrition, habits, and progress, written
            for real routines, not perfect ones.
          </p>
        </div>
      </section>

      <section className="blog-grid-section">
        <div className="wrap">
          {posts.length === 0 ? (
            <p className="blog-empty">
              New posts coming soon, check back shortly.
            </p>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="blog-card"
                >
                  {post.coverImage && (
                    <div className="blog-card-image">
                      <img
                        src={urlFor(post.coverImage).width(500).height(320).url()}
                        alt={post.title}
                      />
                    </div>
                  )}
                  <div className="blog-card-body">
                    {post.category && (
                      <span className="blog-card-category">{post.category}</span>
                    )}
                    <h2>{post.title}</h2>
                    {post.excerpt && <p>{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
export function CollectionStoryRail({ stories = [] }) {
  if (!stories.length) return null;
  return (
    <section className="dp-collection-v3-section" aria-labelledby="dp-collection-story-heading">
      <div className="dp-collection-v3-heading"><p>Local context</p><h3 id="dp-collection-story-heading">Stories</h3></div>
      <div className="dp-collection-story-rail">
        {stories.map((story) => <article key={story.title}><strong>{story.title}</strong><p>{story.body}</p></article>)}
      </div>
    </section>
  );
}

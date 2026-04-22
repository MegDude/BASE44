type FeedItem = Record<string, any>;

export function getLiveNearby(ranked: FeedItem[] = []) {
  if (!Array.isArray(ranked) || ranked.length === 0) return null;

  const liveFirst = ranked.find((item) => {
    const intelligence = item?.metadata?.intelligence || {};
    return (
      intelligence.liveNow ||
      intelligence.activePerkCount > 0 ||
      intelligence.liveEventCount > 0
    );
  });

  if (liveFirst) {
    return {
      ...liveFirst,
      metadata: {
        ...(liveFirst?.metadata || {}),
        intelligence: {
          ...(liveFirst?.metadata?.intelligence || {}),
          isLiveNearby: true,
        },
      },
    };
  }

  const fallback = ranked[0];
  return fallback
    ? {
        ...fallback,
        metadata: {
          ...(fallback?.metadata || {}),
          intelligence: {
            ...(fallback?.metadata?.intelligence || {}),
            isLiveNearby: true,
          },
        },
      }
    : null;
}

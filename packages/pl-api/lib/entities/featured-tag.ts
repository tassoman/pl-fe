import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/FeaturedTag/} */
const featuredTagSchema = v.object({
  id: v.string(),
  name: v.string(),
  url: v.fallback(v.optional(v.string()), undefined),
  statuses_count: v.number(),
  last_status_at: v.number(),
});

type FeaturedTag = v.InferOutput<typeof featuredTagSchema>;

export { featuredTagSchema, type FeaturedTag };

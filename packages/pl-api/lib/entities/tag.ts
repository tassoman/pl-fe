import * as v from 'valibot';

const historySchema = v.object({
  day: v.pipe(v.unknown(), v.transform(Number)),
  accounts: v.pipe(v.unknown(), v.transform(Number)),
  uses: v.pipe(v.unknown(), v.transform(Number)),
});

/** @see {@link https://docs.joinmastodon.org/entities/tag} */
const tagSchema = v.object({
  name: z.string().min(1),
  url: v.fallback(v.pipe(v.string(), v.url()), ''),
  history: v.fallback(v.nullable(historySchema), null),
  following: v.fallback(v.optional(v.boolean()), undefined),
});

type Tag = v.InferOutput<typeof tagSchema>;

export { historySchema, tagSchema, type Tag };

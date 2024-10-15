import * as v from 'valibot';

/** @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apioauth_tokens} */
const oauthTokenSchema = v.pipe(
  v.any(),
  v.transform((token: any) => ({
    ...token,
    valid_until: token?.valid_until?.padEnd(27, 'Z'),
  })),
  v.object({
    app_name: v.string(),
    id: v.number(),
    valid_until: z.string().datetime({ offset: true }),
  }),
);

type OauthToken = v.InferOutput<typeof oauthTokenSchema>;

export { oauthTokenSchema, type OauthToken };

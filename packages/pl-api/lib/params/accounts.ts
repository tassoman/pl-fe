import type { LanguageParam, OnlyEventsParam, OnlyMediaParam, PaginationParams, WithMutedParam, WithRelationshipsParam } from './common';

type GetAccountParams = WithMutedParam;

interface GetAccountStatusesParams extends PaginationParams, WithMutedParam, OnlyEventsParam, OnlyMediaParam, LanguageParam {
  /** Boolean. Filter out statuses in reply to a different account. */
  exclude_replies?: boolean;
  /** Boolean. Filter for pinned statuses only. Defaults to false, which includes all statuses. Pinned statuses do not receive special priority in the order of the returned results. */
  pinned?: boolean;
  /** String. Filter for statuses using a specific hashtag. */
  tagged?: string;
}

type GetAccountFollowersParams = PaginationParams & WithRelationshipsParam;
type GetAccountFollowingParams = PaginationParams & WithRelationshipsParam;

interface FollowAccountParams {
  /** Boolean. Receive this account’s reblogs in home timeline? Defaults to true. */
  reblogs?: boolean;
  /** Boolean. Receive notifications when this account posts a status? Defaults to false. */
  notify?: boolean;
  /**
   * Array of String (ISO 639-1 language two-letter code). Filter received statuses for these languages. If not provided, you will receive this account’s posts in all languages.
   * Requires `features.followAccountLanguages`.
  */
  languages?: string[];
}

interface GetRelationshipsParams {
  /** Boolean. Whether relationships should be returned for suspended users, defaults to false. */
  with_suspended?: boolean;
}

interface SearchAccountParams {
  /** Integer. Maximum number of results. Defaults to 40 accounts. Max 80 accounts. */
  limit?: number;
  /** Integer. Skip the first n results. */
  offset?: number;
  /** Boolean. Attempt WebFinger lookup. Defaults to false. Use this when `q` is an exact address. */
  resolve?: boolean;
  /** Boolean. Limit the search to users you are following. Defaults to false. */
  following?: boolean;
}

interface ReportAccountParams {
  status_ids?: string[];
  comment?: string;
  forward?: boolean;
  category?: 'spam' | 'legal' | 'violation' | 'other';
  rule_ids?: string[];
}

type GetAccountEndorsementsParams = WithRelationshipsParam;
type GetAccountFavouritesParams = PaginationParams;

type GetScrobblesParams = PaginationParams;

interface CreateScrobbleParams {
  /** the title of the media playing */
  title: string;
  /** the album of the media playing */
  album?: string;
  /** the artist of the media playing */
  artist?: string;
  /** the length of the media playing */
  length?: string;
  /** A URL referencing the media playing */
  external_link?: string;
}

export type {
  GetAccountParams,
  GetAccountStatusesParams,
  GetAccountFollowersParams,
  GetAccountFollowingParams,
  FollowAccountParams,
  GetRelationshipsParams,
  SearchAccountParams,
  ReportAccountParams,
  GetAccountEndorsementsParams,
  GetAccountFavouritesParams,
  GetScrobblesParams,
  CreateScrobbleParams,
};

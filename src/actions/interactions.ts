import { defineMessages } from 'react-intl';

import toast, { type IToastOptions } from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures } from 'soapbox/utils/features';

import { getClient } from '../api';

import { fetchRelationships } from './accounts';
import { importFetchedAccounts, importFetchedStatus } from './importer';
import { openModal } from './modals';

import type { Account, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status as StatusEntity } from 'soapbox/types/entities';

const REBLOG_REQUEST = 'REBLOG_REQUEST' as const;
const REBLOG_SUCCESS = 'REBLOG_SUCCESS' as const;
const REBLOG_FAIL    = 'REBLOG_FAIL' as const;

const FAVOURITE_REQUEST = 'FAVOURITE_REQUEST' as const;
const FAVOURITE_SUCCESS = 'FAVOURITE_SUCCESS' as const;
const FAVOURITE_FAIL    = 'FAVOURITE_FAIL' as const;

const DISLIKE_REQUEST = 'DISLIKE_REQUEST' as const;
const DISLIKE_SUCCESS = 'DISLIKE_SUCCESS' as const;
const DISLIKE_FAIL    = 'DISLIKE_FAIL' as const;

const UNREBLOG_REQUEST = 'UNREBLOG_REQUEST' as const;
const UNREBLOG_SUCCESS = 'UNREBLOG_SUCCESS' as const;
const UNREBLOG_FAIL    = 'UNREBLOG_FAIL' as const;

const UNFAVOURITE_REQUEST = 'UNFAVOURITE_REQUEST' as const;
const UNFAVOURITE_SUCCESS = 'UNFAVOURITE_SUCCESS' as const;
const UNFAVOURITE_FAIL    = 'UNFAVOURITE_FAIL' as const;

const UNDISLIKE_REQUEST = 'UNDISLIKE_REQUEST' as const;
const UNDISLIKE_SUCCESS = 'UNDISLIKE_SUCCESS' as const;
const UNDISLIKE_FAIL    = 'UNDISLIKE_FAIL' as const;

const REBLOGS_FETCH_REQUEST = 'REBLOGS_FETCH_REQUEST' as const;
const REBLOGS_FETCH_SUCCESS = 'REBLOGS_FETCH_SUCCESS' as const;
const REBLOGS_FETCH_FAIL    = 'REBLOGS_FETCH_FAIL' as const;

const FAVOURITES_FETCH_REQUEST = 'FAVOURITES_FETCH_REQUEST' as const;
const FAVOURITES_FETCH_SUCCESS = 'FAVOURITES_FETCH_SUCCESS' as const;
const FAVOURITES_FETCH_FAIL    = 'FAVOURITES_FETCH_FAIL' as const;

const DISLIKES_FETCH_REQUEST = 'DISLIKES_FETCH_REQUEST' as const;
const DISLIKES_FETCH_SUCCESS = 'DISLIKES_FETCH_SUCCESS' as const;
const DISLIKES_FETCH_FAIL    = 'DISLIKES_FETCH_FAIL' as const;

const REACTIONS_FETCH_REQUEST = 'REACTIONS_FETCH_REQUEST' as const;
const REACTIONS_FETCH_SUCCESS = 'REACTIONS_FETCH_SUCCESS' as const;
const REACTIONS_FETCH_FAIL    = 'REACTIONS_FETCH_FAIL' as const;

const PIN_REQUEST = 'PIN_REQUEST' as const;
const PIN_SUCCESS = 'PIN_SUCCESS' as const;
const PIN_FAIL    = 'PIN_FAIL' as const;

const UNPIN_REQUEST = 'UNPIN_REQUEST' as const;
const UNPIN_SUCCESS = 'UNPIN_SUCCESS' as const;
const UNPIN_FAIL    = 'UNPIN_FAIL' as const;

const BOOKMARK_REQUEST = 'BOOKMARK_REQUEST' as const;
const BOOKMARK_SUCCESS = 'BOOKMARKED_SUCCESS' as const;
const BOOKMARK_FAIL    = 'BOOKMARKED_FAIL' as const;

const UNBOOKMARK_REQUEST = 'UNBOOKMARKED_REQUEST' as const;
const UNBOOKMARK_SUCCESS = 'UNBOOKMARKED_SUCCESS' as const;
const UNBOOKMARK_FAIL    = 'UNBOOKMARKED_FAIL' as const;

const REMOTE_INTERACTION_REQUEST = 'REMOTE_INTERACTION_REQUEST' as const;
const REMOTE_INTERACTION_SUCCESS = 'REMOTE_INTERACTION_SUCCESS' as const;
const REMOTE_INTERACTION_FAIL    = 'REMOTE_INTERACTION_FAIL' as const;

const FAVOURITES_EXPAND_SUCCESS = 'FAVOURITES_EXPAND_SUCCESS' as const;
const FAVOURITES_EXPAND_FAIL = 'FAVOURITES_EXPAND_FAIL' as const;

const REBLOGS_EXPAND_SUCCESS = 'REBLOGS_EXPAND_SUCCESS' as const;
const REBLOGS_EXPAND_FAIL = 'REBLOGS_EXPAND_FAIL' as const;

type AccountListLink = () => Promise<PaginatedResponse<Account>>;

const messages = defineMessages({
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  folderChanged: { id: 'status.bookmark_folder_changed', defaultMessage: 'Changed folder' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  selectFolder: { id: 'status.bookmark.select_folder', defaultMessage: 'Select folder' },
});

const reblog = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(reblogRequest(status));

    return getClient(getState()).statuses.reblogStatus(status.id).then((response) => {
      // The reblog API method returns a new status wrapped around the original. In this case we are only
      // interested in how the original is modified, hence passing it skipping the wrapper
      if (response.reblog) dispatch(importFetchedStatus(response.reblog));
      dispatch(reblogSuccess(status));
    }).catch(error => {
      dispatch(reblogFail(status, error));
    });
  };

const unreblog = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unreblogRequest(status));

    return getClient(getState()).statuses.unreblogStatus(status.id).then(() => {
      dispatch(unreblogSuccess(status));
    }).catch(error => {
      dispatch(unreblogFail(status, error));
    });
  };

const toggleReblog = (status: StatusEntity) =>
  (dispatch: AppDispatch) => {
    if (status.reblogged) {
      dispatch(unreblog(status));
    } else {
      dispatch(reblog(status));
    }
  };

const reblogRequest = (status: StatusEntity) => ({
  type: REBLOG_REQUEST,
  status: status,
  skipLoading: true,
});

const reblogSuccess = (status: StatusEntity) => ({
  type: REBLOG_SUCCESS,
  status: status,
  skipLoading: true,
});

const reblogFail = (status: StatusEntity, error: unknown) => ({
  type: REBLOG_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const unreblogRequest = (status: StatusEntity) => ({
  type: UNREBLOG_REQUEST,
  status: status,
  skipLoading: true,
});

const unreblogSuccess = (status: StatusEntity) => ({
  type: UNREBLOG_SUCCESS,
  status: status,
  skipLoading: true,
});

const unreblogFail = (status: StatusEntity, error: unknown) => ({
  type: UNREBLOG_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const favourite = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(favouriteRequest(status));

    return getClient(getState()).statuses.favouriteStatus(status.id).then(() => {
      dispatch(favouriteSuccess(status));
    }).catch((error) => {
      dispatch(favouriteFail(status, error));
    });
  };

const unfavourite = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unfavouriteRequest(status));

    return getClient(getState()).statuses.unfavouriteStatus(status.id).then(() => {
      dispatch(unfavouriteSuccess(status));
    }).catch(error => {
      dispatch(unfavouriteFail(status, error));
    });
  };

const toggleFavourite = (status: StatusEntity) =>
  (dispatch: AppDispatch) => {
    if (status.favourited) {
      dispatch(unfavourite(status));
    } else {
      dispatch(favourite(status));
    }
  };

const favouriteRequest = (status: StatusEntity) => ({
  type: FAVOURITE_REQUEST,
  status: status,
  skipLoading: true,
});

const favouriteSuccess = (status: StatusEntity) => ({
  type: FAVOURITE_SUCCESS,
  status: status,
  skipLoading: true,
});

const favouriteFail = (status: StatusEntity, error: unknown) => ({
  type: FAVOURITE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const unfavouriteRequest = (status: StatusEntity) => ({
  type: UNFAVOURITE_REQUEST,
  status: status,
  skipLoading: true,
});

const unfavouriteSuccess = (status: StatusEntity) => ({
  type: UNFAVOURITE_SUCCESS,
  status: status,
  skipLoading: true,
});

const unfavouriteFail = (status: StatusEntity, error: unknown) => ({
  type: UNFAVOURITE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const dislike = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(dislikeRequest(status));

    return getClient(getState).request(`/api/friendica/statuses/${status.id}/dislike`, { method: 'POST' }).then(() => {
      dispatch(dislikeSuccess(status));
    }).catch((error) => {
      dispatch(dislikeFail(status, error));
    });
  };

const undislike = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(undislikeRequest(status));

    return getClient(getState).request(`/api/friendica/statuses/${status.id}/undislike`, { method: 'POST' }).then(() => {
      dispatch(undislikeSuccess(status));
    }).catch(error => {
      dispatch(undislikeFail(status, error));
    });
  };

const toggleDislike = (status: StatusEntity) =>
  (dispatch: AppDispatch) => {
    if (status.disliked) {
      dispatch(undislike(status));
    } else {
      dispatch(dislike(status));
    }
  };

const dislikeRequest = (status: StatusEntity) => ({
  type: DISLIKE_REQUEST,
  status: status,
  skipLoading: true,
});

const dislikeSuccess = (status: StatusEntity) => ({
  type: DISLIKE_SUCCESS,
  status: status,
  skipLoading: true,
});

const dislikeFail = (status: StatusEntity, error: unknown) => ({
  type: DISLIKE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const undislikeRequest = (status: StatusEntity) => ({
  type: UNDISLIKE_REQUEST,
  status: status,
  skipLoading: true,
});

const undislikeSuccess = (status: StatusEntity) => ({
  type: UNDISLIKE_SUCCESS,
  status: status,
  skipLoading: true,
});

const undislikeFail = (status: StatusEntity, error: unknown) => ({
  type: UNDISLIKE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const bookmark = (status: StatusEntity, folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    dispatch(bookmarkRequest(status));

    return getClient(getState()).statuses.bookmarkStatus(status.id, folderId).then((response) => {
      dispatch(importFetchedStatus(response));
      dispatch(bookmarkSuccess(status, response));

      let opts: IToastOptions = {
        actionLabel: messages.view,
        actionLink: folderId ? `/bookmarks/${folderId}` : '/bookmarks/all',
      };

      if (features.bookmarkFolders && typeof folderId !== 'string') {
        opts = {
          actionLabel: messages.selectFolder,
          action: () => dispatch(openModal('SELECT_BOOKMARK_FOLDER', {
            statusId: status.id,
          })),
        };
      }

      toast.success(typeof folderId === 'string' ? messages.folderChanged : messages.bookmarkAdded, opts);
    }).catch((error) => {
      dispatch(bookmarkFail(status, error));
    });
  };

const unbookmark = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(unbookmarkRequest(status));

    return getClient(getState()).statuses.unbookmarkStatus(status.id).then(response => {
      dispatch(importFetchedStatus(response));
      dispatch(unbookmarkSuccess(status, response));
      toast.success(messages.bookmarkRemoved);
    }).catch(error => {
      dispatch(unbookmarkFail(status, error));
    });
  };

const toggleBookmark = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (status.bookmarked) {
      dispatch(unbookmark(status));
    } else {
      dispatch(bookmark(status));
    }
  };

const bookmarkRequest = (status: StatusEntity) => ({
  type: BOOKMARK_REQUEST,
  status: status,
});

const bookmarkSuccess = (status: StatusEntity, response: APIEntity) => ({
  type: BOOKMARK_SUCCESS,
  status: status,
  response: response,
});

const bookmarkFail = (status: StatusEntity, error: unknown) => ({
  type: BOOKMARK_FAIL,
  status: status,
  error: error,
});

const unbookmarkRequest = (status: StatusEntity) => ({
  type: UNBOOKMARK_REQUEST,
  status: status,
});

const unbookmarkSuccess = (status: StatusEntity, response: APIEntity) => ({
  type: UNBOOKMARK_SUCCESS,
  status: status,
  response: response,
});

const unbookmarkFail = (status: StatusEntity, error: unknown) => ({
  type: UNBOOKMARK_FAIL,
  status: status,
  error,
});

const fetchReblogs = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchReblogsRequest(id));

    return getClient(getState()).statuses.getRebloggedBy(id).then(response => {
      dispatch(importFetchedAccounts(response.items));
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(fetchReblogsSuccess(id, response.items, response.next));
    }).catch(error => {
      dispatch(fetchReblogsFail(id, error));
    });
  };

const fetchReblogsRequest = (id: string) => ({
  type: REBLOGS_FETCH_REQUEST,
  id,
});

const fetchReblogsSuccess = (id: string, accounts: APIEntity[], next: AccountListLink | null) => ({
  type: REBLOGS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchReblogsFail = (id: string, error: unknown) => ({
  type: REBLOGS_FETCH_FAIL,
  id,
  error,
});

const expandReblogs = (id: string, next: AccountListLink) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    next().then(response => {
      dispatch(importFetchedAccounts(response.items));
      dispatch(fetchRelationships(response.items.map((item: APIEntity) => item.id)));
      dispatch(expandReblogsSuccess(id, response.items, response.next));
    }).catch(error => {
      dispatch(expandReblogsFail(id, error));
    });
  };

const expandReblogsSuccess = (id: string, accounts: APIEntity[], next: AccountListLink | null) => ({
  type: REBLOGS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandReblogsFail = (id: string, error: unknown) => ({
  type: REBLOGS_EXPAND_FAIL,
  id,
  error,
});

const fetchFavourites = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchFavouritesRequest(id));

    return getClient(getState()).statuses.getFavouritedBy(id).then(response => {
      dispatch(importFetchedAccounts(response.items));
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(fetchFavouritesSuccess(id, response.items, response.next));
    }).catch(error => {
      dispatch(fetchFavouritesFail(id, error));
    });
  };

const fetchFavouritesRequest = (id: string) => ({
  type: FAVOURITES_FETCH_REQUEST,
  id,
});

const fetchFavouritesSuccess = (id: string, accounts: APIEntity[], next: AccountListLink | null) => ({
  type: FAVOURITES_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchFavouritesFail = (id: string, error: unknown) => ({
  type: FAVOURITES_FETCH_FAIL,
  id,
  error,
});

const expandFavourites = (id: string, next: AccountListLink) =>
  (dispatch: AppDispatch) => {
    next().then(response => {
      dispatch(importFetchedAccounts(response.items));
      dispatch(fetchRelationships(response.items.map((item) => item.id)));
      dispatch(expandFavouritesSuccess(id, response.items, response.next));
    }).catch(error => {
      dispatch(expandFavouritesFail(id, error));
    });
  };

const expandFavouritesSuccess = (id: string, accounts: APIEntity[], next: AccountListLink | null) => ({
  type: FAVOURITES_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandFavouritesFail = (id: string, error: unknown) => ({
  type: FAVOURITES_EXPAND_FAIL,
  id,
  error,
});

const fetchDislikes = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchDislikesRequest(id));

    return getClient(getState).request(`/api/friendica/statuses/${id}/disliked_by`).then(response => {
      dispatch(importFetchedAccounts(response.json));
      dispatch(fetchRelationships(response.json.map((item: APIEntity) => item.id)));
      dispatch(fetchDislikesSuccess(id, response.json));
    }).catch(error => {
      dispatch(fetchDislikesFail(id, error));
    });
  };

const fetchDislikesRequest = (id: string) => ({
  type: DISLIKES_FETCH_REQUEST,
  id,
});

const fetchDislikesSuccess = (id: string, accounts: APIEntity[]) => ({
  type: DISLIKES_FETCH_SUCCESS,
  id,
  accounts,
});

const fetchDislikesFail = (id: string, error: unknown) => ({
  type: DISLIKES_FETCH_FAIL,
  id,
  error,
});

const fetchReactions = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchReactionsRequest(id));

    return getClient(getState).statuses.getStatusReactions(id).then(response => {
      dispatch(importFetchedAccounts((response).map(({ accounts }) => accounts).flat()));
      dispatch(fetchReactionsSuccess(id, response));
    }).catch(error => {
      dispatch(fetchReactionsFail(id, error));
    });
  };

const fetchReactionsRequest = (id: string) => ({
  type: REACTIONS_FETCH_REQUEST,
  id,
});

const fetchReactionsSuccess = (id: string, reactions: APIEntity[]) => ({
  type: REACTIONS_FETCH_SUCCESS,
  id,
  reactions,
});

const fetchReactionsFail = (id: string, error: unknown) => ({
  type: REACTIONS_FETCH_FAIL,
  id,
  error,
});

const pin = (status: StatusEntity, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(pinRequest(status, accountId));

    return getClient(getState()).statuses.pinStatus(status.id).then(response => {
      dispatch(importFetchedStatus(response));
      dispatch(pinSuccess(status, accountId));
    }).catch(error => {
      dispatch(pinFail(status, error, accountId));
    });
  };

const pinRequest = (status: StatusEntity, accountId: string) => ({
  type: PIN_REQUEST,
  status,
  skipLoading: true,
  accountId,
});

const pinSuccess = (status: StatusEntity, accountId: string) => ({
  type: PIN_SUCCESS,
  status,
  skipLoading: true,
  accountId,
});

const pinFail = (status: StatusEntity, error: unknown, accountId: string) => ({
  type: PIN_FAIL,
  status,
  error,
  skipLoading: true,
  accountId,
});

const unpin = (status: StatusEntity, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unpinRequest(status, accountId));

    return getClient(getState()).statuses.unpinStatus(status.id).then(response => {
      dispatch(importFetchedStatus(response));
      dispatch(unpinSuccess(status, accountId));
    }).catch(error => {
      dispatch(unpinFail(status, error, accountId));
    });
  };

const togglePin = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().me;

    if (!accountId) return;

    if (status.pinned) {
      dispatch(unpin(status, accountId));
    } else {
      dispatch(pin(status, accountId));
    }
  };

const unpinRequest = (status: StatusEntity, accountId: string) => ({
  type: UNPIN_REQUEST,
  status,
  skipLoading: true,
  accountId,
});

const unpinSuccess = (status: StatusEntity, accountId: string) => ({
  type: UNPIN_SUCCESS,
  status,
  skipLoading: true,
  accountId,
});

const unpinFail = (status: StatusEntity, error: unknown, accountId: string) => ({
  type: UNPIN_FAIL,
  status,
  error,
  skipLoading: true,
  accountId,
});

const remoteInteraction = (ap_id: string, profile: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(remoteInteractionRequest(ap_id, profile));

    return getClient(getState).request('/api/v1/pleroma/remote_interaction', {
      method: 'POST',
      body: JSON.stringify({ ap_id, profile }),
    }).then(({ json: data }) => {
      if (data.error) throw new Error(data.error);

      dispatch(remoteInteractionSuccess(ap_id, profile, data.url));

      return data.url;
    }).catch(error => {
      dispatch(remoteInteractionFail(ap_id, profile, error));
      throw error;
    });
  };

const remoteInteractionRequest = (ap_id: string, profile: string) => ({
  type: REMOTE_INTERACTION_REQUEST,
  ap_id,
  profile,
});

const remoteInteractionSuccess = (ap_id: string, profile: string, url: string) => ({
  type: REMOTE_INTERACTION_SUCCESS,
  ap_id,
  profile,
  url,
});

const remoteInteractionFail = (ap_id: string, profile: string, error: unknown) => ({
  type: REMOTE_INTERACTION_FAIL,
  ap_id,
  profile,
  error,
});

export {
  REBLOG_REQUEST,
  REBLOG_SUCCESS,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_SUCCESS,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  DISLIKE_SUCCESS,
  DISLIKE_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_SUCCESS,
  UNREBLOG_FAIL,
  UNFAVOURITE_REQUEST,
  UNFAVOURITE_SUCCESS,
  UNFAVOURITE_FAIL,
  UNDISLIKE_REQUEST,
  UNDISLIKE_SUCCESS,
  UNDISLIKE_FAIL,
  REBLOGS_FETCH_REQUEST,
  REBLOGS_FETCH_SUCCESS,
  REBLOGS_FETCH_FAIL,
  FAVOURITES_FETCH_REQUEST,
  FAVOURITES_FETCH_SUCCESS,
  FAVOURITES_FETCH_FAIL,
  DISLIKES_FETCH_REQUEST,
  DISLIKES_FETCH_SUCCESS,
  DISLIKES_FETCH_FAIL,
  REACTIONS_FETCH_REQUEST,
  REACTIONS_FETCH_SUCCESS,
  REACTIONS_FETCH_FAIL,
  PIN_REQUEST,
  PIN_SUCCESS,
  PIN_FAIL,
  UNPIN_REQUEST,
  UNPIN_SUCCESS,
  UNPIN_FAIL,
  BOOKMARK_REQUEST,
  BOOKMARK_SUCCESS,
  BOOKMARK_FAIL,
  UNBOOKMARK_REQUEST,
  UNBOOKMARK_SUCCESS,
  UNBOOKMARK_FAIL,
  REMOTE_INTERACTION_REQUEST,
  REMOTE_INTERACTION_SUCCESS,
  REMOTE_INTERACTION_FAIL,
  FAVOURITES_EXPAND_SUCCESS,
  FAVOURITES_EXPAND_FAIL,
  REBLOGS_EXPAND_SUCCESS,
  REBLOGS_EXPAND_FAIL,
  reblog,
  unreblog,
  toggleReblog,
  reblogRequest,
  reblogSuccess,
  reblogFail,
  unreblogRequest,
  unreblogSuccess,
  unreblogFail,
  favourite,
  unfavourite,
  toggleFavourite,
  favouriteRequest,
  favouriteSuccess,
  favouriteFail,
  unfavouriteRequest,
  unfavouriteSuccess,
  unfavouriteFail,
  dislike,
  undislike,
  toggleDislike,
  dislikeRequest,
  dislikeSuccess,
  dislikeFail,
  undislikeRequest,
  undislikeSuccess,
  undislikeFail,
  bookmark,
  unbookmark,
  toggleBookmark,
  bookmarkRequest,
  bookmarkSuccess,
  bookmarkFail,
  unbookmarkRequest,
  unbookmarkSuccess,
  unbookmarkFail,
  fetchReblogs,
  fetchReblogsRequest,
  fetchReblogsSuccess,
  fetchReblogsFail,
  expandReblogs,
  fetchFavourites,
  fetchFavouritesRequest,
  fetchFavouritesSuccess,
  fetchFavouritesFail,
  expandFavourites,
  fetchDislikes,
  fetchDislikesRequest,
  fetchDislikesSuccess,
  fetchDislikesFail,
  fetchReactions,
  fetchReactionsRequest,
  fetchReactionsSuccess,
  fetchReactionsFail,
  pin,
  pinRequest,
  pinSuccess,
  pinFail,
  unpin,
  unpinRequest,
  unpinSuccess,
  unpinFail,
  togglePin,
  remoteInteraction,
  remoteInteractionRequest,
  remoteInteractionSuccess,
  remoteInteractionFail,
};

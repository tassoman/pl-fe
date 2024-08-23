import { Map as ImmutableMap, List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import { defineMessage } from 'react-intl';
import { createSelector } from 'reselect';

import { patchMe } from 'soapbox/actions/me';
import messages from 'soapbox/messages';
import toast from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';

import type { AppDispatch, RootState } from 'soapbox/store';

const SETTING_CHANGE = 'SETTING_CHANGE' as const;
const SETTING_SAVE = 'SETTING_SAVE' as const;
const SETTINGS_UPDATE = 'SETTINGS_UPDATE' as const;

const FE_NAME = 'pl_fe';

/** Options when changing/saving settings. */
type SettingOpts = {
  /** Whether to display an alert when settings are saved. */
  showAlert?: boolean;
}

const saveSuccessMessage = defineMessage({ id: 'settings.save.success', defaultMessage: 'Your preferences have been saved!' });

const defaultSettings = ImmutableMap({
  onboarded: false,
  skinTone: 1,
  reduceMotion: false,
  underlineLinks: false,
  autoPlayGif: true,
  displayMedia: 'default',
  displaySpoilers: false,
  unfollowModal: true,
  boostModal: false,
  deleteModal: true,
  missingDescriptionModal: true,
  defaultPrivacy: 'public',
  defaultContentType: 'text/plain',
  themeMode: 'system',
  locale: navigator.language || 'en',
  showExplanationBox: true,
  explanationBox: true,
  autoloadTimelines: true,
  autoloadMore: false,
  preserveSpoilers: true,
  autoTranslate: false,
  knownLanguages: ImmutableOrderedSet(),

  systemFont: false,
  demetricator: false,

  isDeveloper: false,

  chats: ImmutableMap({
    panes: ImmutableList(),
    mainWindow: 'minimized',
    sound: true,
  }),

  home: ImmutableMap({
    shows: ImmutableMap({
      reblog: true,
      reply: true,
      direct: false,
    }),
  }),

  notifications: ImmutableMap({
    quickFilter: ImmutableMap({
      active: 'all',
      show: true,
      advanced: false,
    }),

    sounds: ImmutableMap({
      follow: false,
      follow_request: false,
      favourite: false,
      reblog: false,
      mention: false,
      poll: false,
      move: false,
      emoji_reaction: false,
    }),
  }),

  'public:local': ImmutableMap({
    shows: ImmutableMap({
      reblog: false,
      reply: true,
      direct: false,
    }),
    other: ImmutableMap({
      onlyMedia: false,
    }),
  }),

  public: ImmutableMap({
    shows: ImmutableMap({
      reblog: true,
      reply: true,
      direct: false,
    }),
    other: ImmutableMap({
      onlyMedia: false,
    }),
  }),

  direct: ImmutableMap({
  }),

  account_timeline: ImmutableMap({
    shows: ImmutableMap({
      reblog: true,
      pinned: true,
      direct: false,
    }),
  }),

  trends: ImmutableMap({
    show: true,
  }),

  remote_timeline: ImmutableMap({
    pinnedHosts: ImmutableList(),
  }),
});

const getSettings = createSelector([
  (state: RootState) => state.soapbox.get('defaultSettings'),
  (state: RootState) => state.settings,
], (soapboxSettings, settings) => defaultSettings.mergeDeep(soapboxSettings).mergeDeep(settings));

interface SettingChangeAction {
  type: typeof SETTING_CHANGE;
  path: string[];
  value: any;
}

const changeSettingImmediate = (path: string[], value: any, opts?: SettingOpts) =>
  (dispatch: AppDispatch) => {
    const action: SettingChangeAction = {
      type: SETTING_CHANGE,
      path,
      value,
    };

    dispatch(action);
    dispatch(saveSettings(opts));
  };

const changeSetting = (path: string[], value: any, opts?: SettingOpts) =>
  (dispatch: AppDispatch) => {
    const action: SettingChangeAction = {
      type: SETTING_CHANGE,
      path,
      value,
    };

    dispatch(action);
    return dispatch(saveSettings(opts));
  };

const saveSettings = (opts?: SettingOpts) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    if (getSettings(state).getIn(['saved'])) return;

    const data = state.settings.delete('saved').toJS();

    dispatch(patchMe({
      pleroma_settings_store: {
        [FE_NAME]: data,
      },
    })).then(() => {
      dispatch({ type: SETTING_SAVE });

      if (opts?.showAlert) {
        toast.success(saveSuccessMessage);
      }
    }).catch(error => {
      toast.showAlertForError(error);
    });
  };

const getLocale = (state: RootState, fallback = 'en') => {
  const localeWithVariant = (getSettings(state).get('locale') as string).replace('_', '-');
  const locale = localeWithVariant.split('-')[0];
  return Object.keys(messages).includes(localeWithVariant) ? localeWithVariant : Object.keys(messages).includes(locale) ? locale : fallback;
};

type SettingsAction =
  | SettingChangeAction
  | { type: typeof SETTING_SAVE }

export {
  SETTING_CHANGE,
  SETTING_SAVE,
  SETTINGS_UPDATE,
  FE_NAME,
  defaultSettings,
  getSettings,
  changeSettingImmediate,
  changeSetting,
  saveSettings,
  getLocale,
  type SettingsAction,
};

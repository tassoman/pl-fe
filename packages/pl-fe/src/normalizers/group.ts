import escapeTextContentForBrowser from 'escape-html';

import emojify from 'soapbox/features/emoji';
import { unescapeHTML } from 'soapbox/utils/html';
import { makeEmojiMap } from 'soapbox/utils/normalizers';

import type { Group as BaseGroup } from 'pl-api';

const getDomainFromURL = (group: Pick<BaseGroup, 'url'>): string => {
  try {
    const url = group.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const normalizeGroup = (group: BaseGroup) => {
  const missingAvatar = require('soapbox/assets/images/avatar-missing.png');
  const missingHeader = require('soapbox/assets/images/header-missing.png');

  const domain = getDomainFromURL(group);
  const note = group.note === '<p></p>' ? '' : group.note;

  const emojiMap = makeEmojiMap(group.emojis);

  return {
    ...group,
    avatar: group.avatar || group.avatar_static || missingAvatar,
    avatar_static: group.avatar_static || group.avatar || missingAvatar,
    header: group.header || group.header_static || missingHeader,
    header_static: group.header_static || group.header || missingHeader,
    domain,
    note,
    display_name_html: emojify(escapeTextContentForBrowser(group.display_name), emojiMap),
    note_emojified: emojify(group.note, emojiMap),
    note_plain: unescapeHTML(group.note),
  };
};

type Group = ReturnType<typeof normalizeGroup>;

export { normalizeGroup, type Group };
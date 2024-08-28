import emojify from 'soapbox/features/emoji';
import { stripCompatibilityFeatures } from 'soapbox/utils/html';
import { makeEmojiMap } from 'soapbox/utils/normalizers';

import type { Status, Translation as BaseTranslation } from 'pl-api';

const normalizeTranslation = (translation: BaseTranslation, status: Pick<Status, 'emojis'>) => {
  const emojiMap = makeEmojiMap(status.emojis);
  const content = stripCompatibilityFeatures(emojify(translation.content, emojiMap));

  return {
    ...translation,
    content,
  };
};

type Translation = ReturnType<typeof normalizeTranslation>;

export { normalizeTranslation, type Translation };
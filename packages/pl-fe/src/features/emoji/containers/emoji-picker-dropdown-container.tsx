import { useFloating, shift, flip } from '@floating-ui/react';
import React, { KeyboardEvent, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { IconButton, Portal } from 'pl-fe/components/ui';
import { useClickOutside } from 'pl-fe/hooks';

import EmojiPickerDropdown, { IEmojiPickerDropdown } from '../components/emoji-picker-dropdown';

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

const EmojiPickerDropdownContainer = (
  { children, ...props }: Pick<IEmojiPickerDropdown, 'onPickEmoji' | 'condensed' | 'withCustom'> & { children?: JSX.Element },
) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.emoji);
  const [visible, setVisible] = useState(false);

  const { x, y, strategy, refs, update } = useFloating<HTMLButtonElement>({
    middleware: [flip(), shift()],
  });

  useClickOutside(refs, () => {
    setVisible(false);
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setVisible(!visible);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['Enter', ' '].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      setVisible(!visible);
    }
  };

  return (
    <div className='relative'>
      {children ? (
        React.cloneElement(children, {
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          ref: refs.setReference,
        })
      ) : (
        <IconButton
          className='emoji-picker-dropdown text-gray-600 hover:text-gray-700 dark:hover:text-gray-500'
          ref={refs.setReference}
          src={require('@tabler/icons/outline/mood-happy.svg')}
          title={title}
          aria-label={title}
          aria-expanded={visible}
          role='button'
          onClick={handleClick as any}
          onKeyDown={handleKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
          tabIndex={0}
        />)}

      <Portal>
        <div
          className='z-[101]'
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
        >
          <EmojiPickerDropdown
            visible={visible}
            setVisible={setVisible}
            update={update}
            {...props}
          />
        </div>
      </Portal>
    </div>
  );
};

export {
  messages,
  EmojiPickerDropdownContainer as default,
};

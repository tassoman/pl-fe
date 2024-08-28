import clsx from 'clsx';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedList, FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { mentionCompose, replyCompose } from 'soapbox/actions/compose';
import { toggleFavourite, toggleReblog } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { toggleStatusMediaHidden, unfilterStatus } from 'soapbox/actions/statuses';
import TranslateButton from 'soapbox/components/translate-button';
import AccountContainer from 'soapbox/containers/account-container';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys';
import { useAppDispatch, useAppSelector, useSettings } from 'soapbox/hooks';
import { makeGetStatus, type SelectedStatus } from 'soapbox/selectors';
import { textForScreenReader } from 'soapbox/utils/status';

import EventPreview from './event-preview';
import StatusActionBar from './status-action-bar';
import StatusContent from './status-content';
import StatusLanguagePicker from './status-language-picker';
import StatusMedia from './status-media';
import StatusReplyMentions from './status-reply-mentions';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';
import StatusInfo from './statuses/status-info';
import { Card, Icon, Stack, Text } from './ui';

const messages = defineMessages({
  reblogged_by: { id: 'status.reblogged_by', defaultMessage: '{name} reposted' },
});

interface IStatus {
  id?: string;
  avatarSize?: number;
  status: SelectedStatus;
  onClick?: () => void;
  muted?: boolean;
  hidden?: boolean;
  unread?: boolean;
  onMoveUp?: (statusId: string, featured?: boolean) => void;
  onMoveDown?: (statusId: string, featured?: boolean) => void;
  focusable?: boolean;
  featured?: boolean;
  hideActionBar?: boolean;
  hoverable?: boolean;
  variant?: 'default' | 'rounded' | 'slim';
  showGroup?: boolean;
  accountAction?: React.ReactElement;
  fromBookmarks?: boolean;
}

const Status: React.FC<IStatus> = (props) => {
  const {
    status,
    accountAction,
    avatarSize = 42,
    focusable = true,
    hoverable = true,
    onClick,
    onMoveUp,
    onMoveDown,
    muted,
    hidden,
    featured,
    unread,
    hideActionBar,
    variant = 'rounded',
    showGroup = true,
    fromBookmarks = false,
  } = props;

  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { boostModal } = useSettings();
  const didShowCard = useRef(false);
  const node = useRef<HTMLDivElement>(null);

  const getStatus = useCallback(makeGetStatus(), []);
  const actualStatus = useAppSelector(state => status.reblog_id && getStatus(state, { id: status.reblog_id }) || status)!;

  const isReblog = status.reblog_id;
  const statusUrl = `/@${actualStatus.account.acct}/posts/${actualStatus.id}`;
  const group = actualStatus.group;

  const filtered = (status.filtered?.length || actualStatus.filtered?.length) > 0;

  // Track height changes we know about to compensate scrolling.
  useEffect(() => {
    didShowCard.current = Boolean(!muted && !hidden && status?.card);
  }, []);

  const handleClick = (e?: React.MouseEvent): void => {
    e?.stopPropagation();

    // If the user is selecting text, don't focus the status.
    if (getSelection()?.toString().length) {
      return;
    }

    if (!e || !(e.ctrlKey || e.metaKey)) {
      if (onClick) {
        onClick();
      } else {
        history.push(statusUrl);
      }
    } else {
      window.open(statusUrl, '_blank');
    }
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent): void => {
    const status = actualStatus;
    const firstAttachment = status.media_attachments[0];

    e?.preventDefault();

    if (firstAttachment) {
      if (firstAttachment.type === 'video') {
        dispatch(openModal('VIDEO', { statusId: status.id, media: firstAttachment, time: 0 }));
      } else {
        dispatch(openModal('MEDIA', { statusId: status.id, media: status.media_attachments, index: 0 }));
      }
    }
  };

  const handleHotkeyReply = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(replyCompose(actualStatus, status.reblog_id ? status.account : undefined));
  };

  const handleHotkeyFavourite = (): void => {
    toggleFavourite(actualStatus);
  };

  const handleHotkeyBoost = (e?: KeyboardEvent): void => {
    const modalReblog = () => dispatch(toggleReblog(actualStatus));
    if ((e && e.shiftKey) || !boostModal) {
      modalReblog();
    } else {
      dispatch(openModal('BOOST', { statusId: actualStatus.id, onReblog: modalReblog }));
    }
  };

  const handleHotkeyMention = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(mentionCompose(actualStatus.account));
  };

  const handleHotkeyOpen = (): void => {
    history.push(statusUrl);
  };

  const handleHotkeyOpenProfile = (): void => {
    history.push(`/@${actualStatus.account.acct}`);
  };

  const handleHotkeyMoveUp = (e?: KeyboardEvent): void => {
    if (onMoveUp) {
      onMoveUp(status.id, featured);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent): void => {
    if (onMoveDown) {
      onMoveDown(status.id, featured);
    }
  };

  const handleHotkeyToggleSensitive = (): void => {
    dispatch(toggleStatusMediaHidden(actualStatus));
  };

  const handleHotkeyReact = (): void => {
    _expandEmojiSelector();
  };

  const handleUnfilter = () => dispatch(unfilterStatus(status.filtered.length ? status.id : actualStatus.id));

  const _expandEmojiSelector = (): void => {
    const firstEmoji: HTMLDivElement | null | undefined = node.current?.querySelector('.emoji-react-selector .emoji-react-selector__emoji');
    firstEmoji?.focus();
  };

  const renderStatusInfo = () => {
    if (isReblog && showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/repeat.svg')} className='h-4 w-4 text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by_with_group'
              defaultMessage='{name} reposted from {group}'
              values={{
                name: (
                  <Link
                    to={`/@${status.account.acct}`}
                    className='hover:underline'
                  >
                    <bdi className='truncate'>
                      <strong
                        className='text-gray-800 dark:text-gray-200'
                        dangerouslySetInnerHTML={{
                          __html: status.account.display_name_html,
                        }}
                      />
                    </bdi>
                  </Link>
                ),
                group: (
                  <Link to={`/groups/${group.id}`} className='hover:underline'>
                    <strong
                      className='text-gray-800 dark:text-gray-200'
                      dangerouslySetInnerHTML={{
                        __html: group.display_name_html,
                      }}
                    />
                  </Link>
                ),
              }}
            />
          }
        />
      );
    } else if (isReblog) {
      const accounts = status.accounts || [status.account];

      const renderedAccounts = accounts.slice(0, 2).map(account => !!account && (
        <Link key={account.acct} to={`/@${account.acct}`} className='hover:underline'>
          <bdi className='truncate'>
            <strong
              className='text-gray-800 dark:text-gray-200'
              dangerouslySetInnerHTML={{
                __html: account.display_name_html,
              }}
            />
          </bdi>
        </Link>
      ));

      if (accounts.length > 2) {
        renderedAccounts.push(
          <FormattedMessage
            id='notification.more'
            defaultMessage='{count, plural, one {# other} other {# others}}'
            values={{ count: accounts.length - renderedAccounts.length }}
          />,
        );
      }

      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/repeat.svg')} className='h-4 w-4 text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by'
              defaultMessage='{name} reposted'
              values={{
                name: <FormattedList type='conjunction' value={renderedAccounts} />,
                count: accounts.length,
              }}
            />
          }
        />
      );
    } else if (featured) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/pinned.svg')} className='h-4 w-4 text-gray-600 dark:text-gray-400' />}
          text={
            <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
          }
        />
      );
    } else if (showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/circles.svg')} className='h-4 w-4 text-primary-600 dark:text-accent-blue' />}
          text={
            <FormattedMessage
              id='status.group'
              defaultMessage='Posted in {group}'
              values={{
                group: (
                  <Link to={`/groups/${group.id}`} className='hover:underline'>
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        <span dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
                      </strong>
                    </bdi>
                  </Link>
                ),
              }}
            />
          }
        />
      );
    }
  };

  if (!status) return null;

  if (hidden) {
    return (
      <div ref={node}>
        <>
          {actualStatus.account.display_name || actualStatus.account.username}
          {actualStatus.content}
        </>
      </div>
    );
  }

  if (filtered && status.showFiltered !== false) {
    const minHandlers = muted ? undefined : {
      moveUp: handleHotkeyMoveUp,
      moveDown: handleHotkeyMoveDown,
    };

    return (
      <HotKeys handlers={minHandlers}>
        <div className={clsx('status__wrapper text-center', { focusable })} tabIndex={focusable ? 0 : undefined} ref={node}>
          <Text theme='muted'>
            <FormattedMessage id='status.filtered' defaultMessage='Filtered' />: {status.filtered.join(', ')}.
            {' '}
            <button className='text-primary-600 hover:underline dark:text-accent-blue' onClick={handleUnfilter}>
              <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
            </button>
          </Text>
        </div>
      </HotKeys>
    );
  }

  let rebloggedByText;
  if (status.reblog_id === 'object') {
    rebloggedByText = intl.formatMessage(
      messages.reblogged_by,
      { name: status.account.acct },
    );
  }

  let quote;

  if (actualStatus.quote_id) {
    if ((actualStatus.quote_visible ?? true) === false) {
      quote = (
        <div className='quoted-status-tombstone'>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={actualStatus.quote_id} />;
    }
  }

  const handlers = muted ? undefined : {
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    open: handleHotkeyOpen,
    openProfile: handleHotkeyOpenProfile,
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  return (
    <HotKeys handlers={handlers} data-testid='status'>
      <div
        className={clsx('status cursor-pointer', { focusable })}
        tabIndex={focusable && !muted ? 0 : undefined}
        data-featured={featured ? 'true' : null}
        aria-label={textForScreenReader(intl, actualStatus, rebloggedByText)}
        ref={node}
        onClick={handleClick}
        role='link'
      >
        <Card
          variant={variant}
          className={clsx('status__wrapper space-y-4', `status-${actualStatus.visibility}`, {
            'py-6 sm:p-5': variant === 'rounded',
            'status-reply': !!status.in_reply_to_id,
            muted,
            read: unread === false,
          })}
          data-id={status.id}
        >
          {renderStatusInfo()}

          <AccountContainer
            key={actualStatus.account.id}
            id={actualStatus.account.id}
            timestamp={actualStatus.created_at}
            timestampUrl={statusUrl}
            action={accountAction}
            hideActions={!accountAction}
            showEdit={!!actualStatus.edited_at}
            showProfileHoverCard={hoverable}
            withLinkToProfile={hoverable}
            approvalStatus={actualStatus.approval_status}
            avatarSize={avatarSize}
            items={<StatusLanguagePicker status={status} />}
          />

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={actualStatus} hoverable={hoverable} />

            <Stack className='relative z-0'>
              {actualStatus.event ? <EventPreview className='shadow-xl' status={actualStatus} /> : (
                <Stack space={4}>
                  <StatusContent
                    status={actualStatus}
                    onClick={handleClick}
                    collapsable
                    translatable
                  />

                  <TranslateButton status={actualStatus} />

                  {(quote || actualStatus.card || actualStatus.media_attachments.length > 0) && (
                    <Stack space={4}>
                      {actualStatus.media_attachments.length > 0 && (
                        <div className='relative'>
                          <SensitiveContentOverlay status={actualStatus} />
                          <StatusMedia
                            status={actualStatus}
                            muted={muted}
                            onClick={handleClick}
                          />
                        </div>
                      )}

                      {quote}
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>

            {!hideActionBar && (
              <div className='pt-4'>
                <StatusActionBar status={actualStatus} rebloggedBy={isReblog ? status.account : undefined} fromBookmarks={fromBookmarks} />
              </div>
            )}
          </div>
        </Card>
      </div >
    </HotKeys >
  );
};

export {
  type IStatus,
  Status as default,
};
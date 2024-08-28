import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { getSettings } from 'soapbox/actions/settings';
import { useAccount } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';
import Badge from 'soapbox/components/badge';
import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper';
import RelativeTimestamp from 'soapbox/components/relative-timestamp';
import { Avatar, Stack, Text } from 'soapbox/components/ui';
import ActionButton from 'soapbox/features/ui/components/action-button';
import { useAppSelector } from 'soapbox/hooks';
import { shortNumberFormat } from 'soapbox/utils/numbers';

interface IAccountCard {
  id: string;
}

const AccountCard: React.FC<IAccountCard> = ({ id }) => {
  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(id);
  const autoPlayGif = useAppSelector((state) => getSettings(state).get('autoPlayGif'));

  if (!account) return null;

  const followedBy = me !== account.id && account.relationship?.followed_by;

  return (
    <div className='flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-primary-700 dark:bg-primary-800'>
      <div className='relative'>
        {followedBy && (
          <div className='absolute left-2.5 top-2.5'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}

        <div className='absolute bottom-0 right-3 translate-y-1/2'>
          <ActionButton account={account} small />
        </div>

        <img
          src={autoPlayGif ? account.header : account.header_static}
          alt={account.header_description}
          className='h-32 w-full rounded-t-lg object-cover'
        />

        <HoverRefWrapper key={account.id} accountId={account.id} inline>
          <Link to={`/@${account.acct}`} title={account.acct}>
            <Avatar
              src={account.avatar}
              alt={account.avatar_description}
              className='!absolute bottom-0 left-3 translate-y-1/2 bg-white ring-2 ring-white dark:bg-primary-900 dark:ring-primary-900'
              size={64}
            />
          </Link>
        </HoverRefWrapper>
      </div>

      <Stack space={4} className='p-3 pt-10'>
        <Account
          account={account}
          withAvatar={false}
          withRelationship={false}
        />

        <Text
          truncate
          align='left'
          className='line-clamp-2 [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
          dangerouslySetInnerHTML={{ __html: account.note_emojified || '&nbsp;' }}
        />
      </Stack>

      <div className='grid grid-cols-3 gap-1 py-4'>
        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.statuses_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.followers_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {account.last_status_at ? (
              <RelativeTimestamp theme='inherit' timestamp={account.last_status_at} />
            ) : (
              <FormattedMessage id='account.never_active' defaultMessage='Never' />
            )}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.last_status' defaultMessage='Last active' />
          </Text>
        </Stack>
      </div>
    </div>
  );
};

export { AccountCard as default };
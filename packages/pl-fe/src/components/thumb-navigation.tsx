import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'soapbox/actions/compose';
import { openModal } from 'soapbox/actions/modals';
import { openSidebar } from 'soapbox/actions/sidebar';
import ThumbNavigationLink from 'soapbox/components/thumb-navigation-link';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { Entities } from 'soapbox/entity-store/entities';
import { useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { isStandalone } from 'soapbox/utils/state';

import { Icon } from './ui';

const ThumbNavigation: React.FC = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const features = useFeatures();

  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');

  const { unreadChatsCount } = useStatContext();

  const standalone = useAppSelector(isStandalone);
  const notificationCount = useAppSelector((state) => state.notifications.unread);

  const handleOpenSidebar = () => dispatch(openSidebar());

  const handleOpenComposeModal = () => {
    if (match?.params.groupId) {
      dispatch((_, getState) => {
        const group = getState().entities[Entities.GROUPS]?.store[match.params.groupId];
        if (group) dispatch(groupComposeModal(group));
      });
    } else {
      dispatch(openModal('COMPOSE'));
    }
  };

  /** Conditionally render the supported messages link */
  const renderMessagesLink = (): React.ReactNode => {
    if (features.chats) {
      return (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/messages.svg')}
          text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
          to='/chats'
          exact
          count={unreadChatsCount}
          countMax={9}
        />
      );
    }

    if (features.conversations) {
      return (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/mail.svg')}
          activeSrc={require('@tabler/icons/filled/mail.svg')}
          text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
          to='/conversations'
        />
      );
    }

    return null;
  };

  const composeButton = (
    <button className='flex flex-1 flex-col items-center px-1.5 py-3.5 text-lg text-gray-600' onClick={handleOpenComposeModal}>
      <Icon
        src={require('@tabler/icons/outline/square-rounded-plus.svg')}
        className='h-6 w-6 text-gray-600 black:text-white'
      />
    </button>
  );

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 flex w-full overflow-x-auto border-t border-solid border-gray-200 bg-white/90 shadow-2xl backdrop-blur-md black:bg-black/80 lg:hidden dark:border-gray-800 dark:bg-primary-900/90'>
      <button className='flex flex-1 flex-col items-center px-2 py-4 text-lg text-gray-600' onClick={handleOpenSidebar}>
        <Icon
          src={require('@tabler/icons/outline/menu-2.svg')}
          className='h-5 w-5 text-gray-600 black:text-white'
        />
      </button>

      <ThumbNavigationLink
        src={require('@tabler/icons/outline/home.svg')}
        activeSrc={require('@tabler/icons/filled/home.svg')}
        text={<FormattedMessage id='navigation.home' defaultMessage='Home' />}
        to='/'
        exact
      />

      {/* {features.groups && (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/circles.svg')}
          activeSrc={require('@tabler/icons/filled/circles.svg')}
          text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
          to='/groups'
          exact
        />
      )} */}

      {account && !(features.chats || features.conversations) && composeButton}

      {(!standalone || account) && (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/search.svg')}
          text={<FormattedMessage id='navigation.search' defaultMessage='Search' />}
          to='/search'
          exact
        />
      )}

      {account && (
        <ThumbNavigationLink
          src={require('@tabler/icons/outline/bell.svg')}
          activeSrc={require('@tabler/icons/filled/bell.svg')}
          text={<FormattedMessage id='navigation.notifications' defaultMessage='Notifications' />}
          to='/notifications'
          exact
          count={notificationCount}
        />
      )}

      {account && renderMessagesLink()}

      {account && (features.chats || features.conversations) && composeButton}
    </div>
  );
};

export { ThumbNavigation as default };
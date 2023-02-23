import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Banner, Button, HStack, Stack, Text } from 'soapbox/components/ui';
import { useAppSelector, useInstance, useSoapboxConfig } from 'soapbox/hooks';

const acceptedGdpr = !!localStorage.getItem('soapbox:gdpr');

/** Displays a cookie consent banner. */
const GdprBanner: React.FC = () => {
  /** Track whether the banner has already been displayed once. */
  const [shown, setShown] = useState<boolean>(acceptedGdpr);
  const [slideout, setSlideout] = useState(false);

  const instance = useInstance();
  const soapbox = useSoapboxConfig();
  const isLoggedIn = useAppSelector(state => !!state.me);

  const handleAccept = () => {
    localStorage.setItem('soapbox:gdpr', 'true');
    setSlideout(true);
    setTimeout(() => setShown(true), 200);
  };

  const showBanner = soapbox.gdpr && !isLoggedIn && !shown;

  if (!showBanner) {
    return null;
  }

  return (
    <Banner theme='opaque' className={clsx('transition-transform', { 'translate-y-full': slideout })}>
      <div className='flex flex-col space-y-4 rtl:space-x-reverse lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4'>
        <Stack space={2}>
          <Text size='xl' weight='bold'>
            <FormattedMessage id='gdpr.title' defaultMessage='{siteTitle} uses cookies' values={{ siteTitle: instance.title }} />
          </Text>

          <Text weight='medium' className='opacity-60'>
            <FormattedMessage
              id='gdpr.message'
              defaultMessage="{siteTitle} uses session cookies, which are essential to the website's functioning."
              values={{ siteTitle: instance.title }}
            />
          </Text>
        </Stack>

        <HStack space={2} alignItems='center' className='flex-none'>
          {soapbox.gdprUrl && (
            <a href={soapbox.gdprUrl} tabIndex={-1} className='inline-flex'>
              <Button theme='secondary'>
                <FormattedMessage id='gdpr.learn_more' defaultMessage='Learn more' />
              </Button>
            </a>
          )}

          <Button theme='accent' onClick={handleAccept}>
            <FormattedMessage id='gdpr.accept' defaultMessage='Accept' />
          </Button>
        </HStack>
      </div>
    </Banner>
  );
};

export default GdprBanner;

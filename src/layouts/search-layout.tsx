import React from 'react';

import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'soapbox/hooks';

import { Layout } from '../components/ui';

interface ISearchLayout {
  children: React.ReactNode;
}

const SearchLayout: React.FC<ISearchLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        {children}

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}

        {features.trends && (
          <TrendsPanel limit={5} />
        )}

        {me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}

        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { SearchLayout as default };
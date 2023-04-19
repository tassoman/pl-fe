import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Components, Virtuoso, VirtuosoGrid } from 'react-virtuoso';

import { Column } from 'soapbox/components/ui';
import { useSuggestedGroups } from 'soapbox/hooks/api/useSuggestedGroups';

import GroupGridItem from './components/discover/group-grid-item';
import GroupListItem from './components/discover/group-list-item';
import LayoutButtons, { GroupLayout } from './components/discover/layout-buttons';

import type { Group } from 'soapbox/schemas';

const messages = defineMessages({
  label: { id: 'groups.popular.label', defaultMessage: 'Suggested Groups' },
});

const GridList: Components['List'] = React.forwardRef((props, ref) => {
  const { context, ...rest } = props;
  return <div ref={ref} {...rest} className='flex flex-wrap' />;
});

const Suggested: React.FC = () => {
  const intl = useIntl();

  const [layout, setLayout] = useState<GroupLayout>(GroupLayout.LIST);

  const { groups, hasNextPage, fetchNextPage } = useSuggestedGroups();

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const renderGroupList = useCallback((group: Group, index: number) => (
    <div
      className={
        clsx({
          'pt-4': index !== 0,
        })
      }
    >
      <GroupListItem group={group} withJoinAction />
    </div>
  ), []);

  const renderGroupGrid = useCallback((group: Group, index: number) => (
    <div className='pb-4'>
      <GroupGridItem group={group} />
    </div>
  ), []);

  return (
    <Column
      label={intl.formatMessage(messages.label)}
      action={
        <LayoutButtons
          layout={layout}
          onSelect={(selectedLayout) => setLayout(selectedLayout)}
        />
      }
    >
      {layout === GroupLayout.LIST ? (
        <Virtuoso
          useWindowScroll
          data={groups}
          itemContent={(index, group) => renderGroupList(group, index)}
          endReached={handleLoadMore}
        />
      ) : (
        <VirtuosoGrid
          useWindowScroll
          data={groups}
          itemContent={(index, group) => renderGroupGrid(group, index)}
          components={{
            Item: (props) => (
              <div {...props} className='w-1/2 flex-none' />
            ),
            List: GridList,
          }}
          endReached={handleLoadMore}
        />
      )}
    </Column>
  );
};

export default Suggested;
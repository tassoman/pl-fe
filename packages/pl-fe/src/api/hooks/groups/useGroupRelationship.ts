import * as v from 'valibot';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks/useEntity';
import { useClient } from 'pl-fe/hooks/useClient';

import type { GroupRelationship } from 'pl-api';

const useGroupRelationship = (groupId: string | undefined) => {
  const client = useClient();

  const { entity: groupRelationship, ...result } = useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId!],
    () => client.experimental.groups.getGroupRelationships([groupId!]),
    {
      enabled: !!groupId,
      schema: v.pipe(v.any(), v.transform(arr => arr[0])),
    },
  );

  return {
    groupRelationship,
    ...result,
  };
};

export { useGroupRelationship };

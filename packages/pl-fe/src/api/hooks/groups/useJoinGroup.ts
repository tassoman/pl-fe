import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';

import { useGroups } from './useGroups';

import type { Group } from 'pl-api';

const useJoinGroup = (group: Pick<Group, 'id'>) => {
  const client = useClient();
  const { invalidate } = useGroups();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    () => client.experimental.groups.joinGroup(group.id),
  );

  return {
    mutate: createEntity,
    isSubmitting,
    invalidate,
  };
};

export { useJoinGroup };
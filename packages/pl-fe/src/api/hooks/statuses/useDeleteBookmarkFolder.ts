import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';

const useDeleteBookmarkFolder = () => {
  const client = useClient();

  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.BOOKMARK_FOLDERS,
    (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
  );

  return {
    deleteBookmarkFolder: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteBookmarkFolder };
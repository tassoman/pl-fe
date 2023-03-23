import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { groupKick } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import Account from 'soapbox/components/account';
import DropdownMenu from 'soapbox/components/dropdown-menu/dropdown-menu';
import { HStack } from 'soapbox/components/ui';
import { deleteEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useAccount, useAppDispatch, useFeatures } from 'soapbox/hooks';
import { useBlockGroupMember, useDemoteGroupMember, usePromoteGroupMember } from 'soapbox/hooks/api';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';

import type { Menu as IMenu } from 'soapbox/components/dropdown-menu';
import type { Account as AccountEntity, Group, GroupMember } from 'soapbox/types/entities';

const messages = defineMessages({
  blockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Ban' },
  blockFromGroupHeading: { id: 'confirmations.block_from_group.heading', defaultMessage: 'Ban From Group' },
  blockFromGroupMessage: { id: 'confirmations.block_from_group.message', defaultMessage: 'Are you sure you want to ban @{name} from the group?' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: '@{name} is banned' },
  demotedToUser: { id: 'group.demote.user.success', defaultMessage: '@{name} is now a member' },
  groupModBlock: { id: 'group.group_mod_block', defaultMessage: 'Ban from group' },
  groupModDemote: { id: 'group.group_mod_demote', defaultMessage: 'Remove {role} role' },
  groupModKick: { id: 'group.group_mod_kick', defaultMessage: 'Kick @{name} from group' },
  groupModPromoteMod: { id: 'group.group_mod_promote_mod', defaultMessage: 'Assign {role} role' },
  kickConfirm: { id: 'confirmations.kick_from_group.confirm', defaultMessage: 'Kick' },
  kickFromGroupMessage: { id: 'confirmations.kick_from_group.message', defaultMessage: 'Are you sure you want to kick @{name} from this group?' },
  kicked: { id: 'group.group_mod_kick.success', defaultMessage: 'Kicked @{name} from group' },
  promoteConfirm: { id: 'group.promote.admin.confirmation.title', defaultMessage: 'Assign Admin Role' },
  promoteConfirmMessage: { id: 'group.promote.admin.confirmation.message', defaultMessage: 'Are you sure you want to assign the admin role to @{name}?' },
  promotedToAdmin: { id: 'group.promote.admin.success', defaultMessage: '@{name} is now an admin' },
});

interface IGroupMemberListItem {
  member: GroupMember
  group: Group
}

const GroupMemberListItem = (props: IGroupMemberListItem) => {
  const { member, group } = props;

  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const blockGroupMember = useBlockGroupMember(group, member);
  const promoteGroupMember = usePromoteGroupMember(group, member);
  const demoteGroupMember = useDemoteGroupMember(group, member);

  const account = useAccount(member.account.id) as AccountEntity;

  // Current user role
  const isCurrentUserOwner = group.relationship?.role === GroupRoles.OWNER;
  const isCurrentUserAdmin = group.relationship?.role === GroupRoles.ADMIN;

  // Member role
  const isMemberOwner = member.role === GroupRoles.OWNER;
  const isMemberAdmin = member.role === GroupRoles.ADMIN;
  const isMemberUser = member.role === GroupRoles.USER;

  const handleKickFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.kickFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.kickConfirm),
      onConfirm: () => dispatch(groupKick(group.id, account.id)).then(() =>
        toast.success(intl.formatMessage(messages.kicked, { name: account.acct })),
      ),
    }));
  };

  const handleBlockFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.blockFromGroupHeading),
      message: intl.formatMessage(messages.blockFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => {
        blockGroupMember({ account_ids: [member.account.id] }, {
          onSuccess() {
            dispatch(deleteEntities([member.id], Entities.GROUP_MEMBERSHIPS));
            toast.success(intl.formatMessage(messages.blocked, { name: account.acct }));
          },
        });
      },
    }));
  };

  const handleAdminAssignment = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.promoteConfirm),
      message: intl.formatMessage(messages.promoteConfirmMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.promoteConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => {
        promoteGroupMember({ role: GroupRoles.ADMIN, account_ids: [account.id] }, {
          onSuccess() {
            toast.success(
              intl.formatMessage(messages.promotedToAdmin, { name: account.acct }),
            );
          },
        });
      },
    }));
  };

  const handleUserAssignment = () => {
    demoteGroupMember({ role: GroupRoles.USER, account_ids: [account.id] }, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.demotedToUser, { name: account.acct }));
      },
    });
  };

  const menu: IMenu = useMemo(() => {
    const items: IMenu = [];

    if (!group || !account || !group.relationship?.role) {
      return items;
    }

    if (isCurrentUserOwner) {
      if (isMemberUser) {
        items.push({
          text: intl.formatMessage(messages.groupModPromoteMod, { role: GroupRoles.ADMIN }),
          icon: require('@tabler/icons/briefcase.svg'),
          action: handleAdminAssignment,
        });
      } else if (isMemberAdmin) {
        items.push({
          text: intl.formatMessage(messages.groupModDemote, { role: GroupRoles.ADMIN, name: account.username }),
          icon: require('@tabler/icons/briefcase.svg'),
          action: handleUserAssignment,
          destructive: true,
        });
      }
    }

    if (
      (isCurrentUserOwner || isCurrentUserAdmin) &&
      (isMemberAdmin || isMemberUser) &&
      member.role !== group.relationship.role
    ) {
      if (features.groupsKick) {
        items.push({
          text: intl.formatMessage(messages.groupModKick, { name: account.username }),
          icon: require('@tabler/icons/user-minus.svg'),
          action: handleKickFromGroup,
        });
      }

      items.push({
        text: intl.formatMessage(messages.groupModBlock, { name: account.username }),
        icon: require('@tabler/icons/ban.svg'),
        action: handleBlockFromGroup,
        destructive: true,
      });
    }

    return items;
  }, [group, account]);

  return (
    <HStack alignItems='center' justifyContent='between'>
      <div className='w-full'>
        <Account account={member.account} withRelationship={false} />
      </div>

      <HStack alignItems='center' space={2}>
        {(isMemberOwner || isMemberAdmin) ? (
          <span
            className={
              clsx('inline-flex items-center rounded px-2 py-1 text-xs font-medium capitalize', {
                'bg-primary-200 text-primary-500': isMemberOwner,
                'bg-gray-200 text-gray-900': isMemberAdmin,
              })
            }
          >
            {member.role}
          </span>
        ) : null}

        <DropdownMenu items={menu} />
      </HStack>
    </HStack>
  );
};

export default GroupMemberListItem;
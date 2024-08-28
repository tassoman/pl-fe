import React, { useCallback } from 'react';

import { cancelReplyCompose } from 'soapbox/actions/compose';
import { useAppDispatch, useAppSelector, useCompose } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import ReplyIndicator from '../components/reply-indicator';

interface IReplyIndicatorContainer {
  composeId: string;
}

const ReplyIndicatorContainer: React.FC<IReplyIndicatorContainer> = ({ composeId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const { in_reply_to: inReplyToId, id: statusId } = useCompose(composeId);
  const status = useAppSelector(state => getStatus(state, { id: inReplyToId! }));
  const dispatch = useAppDispatch();

  const onCancel = () => {
    dispatch(cancelReplyCompose());
  };

  if (!status) return null;

  return (
    <ReplyIndicator status={status} hideActions={!!statusId} onCancel={onCancel} />
  );
};

export { ReplyIndicatorContainer as default };
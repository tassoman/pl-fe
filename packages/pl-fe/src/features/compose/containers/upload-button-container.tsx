import React from 'react';

import { uploadCompose } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/useAppDispatch';
import { useAppSelector } from 'pl-fe/hooks/useAppSelector';

import UploadButton from '../components/upload-button';

import type { IntlShape } from 'react-intl';

interface IUploadButtonContainer {
  composeId: string;
}

const UploadButtonContainer: React.FC<IUploadButtonContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const { disabled, resetFileKey } = useAppSelector((state) => ({
    disabled: state.compose.get(composeId)?.is_uploading,
    resetFileKey: state.compose.get(composeId)?.resetFileKey!,
  }));

  const onSelectFile = (files: FileList, intl: IntlShape) => {
    dispatch(uploadCompose(composeId, files, intl));
  };

  return <UploadButton disabled={disabled} resetFileKey={resetFileKey} onSelectFile={onSelectFile} />;
};

export { UploadButtonContainer as default };

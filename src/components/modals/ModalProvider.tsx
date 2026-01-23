'use client';

import React from 'react';
import AddTaskModal from './AddTaskModal';
import InviteMemberModal from './InviteMemberModal';
import AskOctoOpsModal from './AskOctoOpsModal';
import ImageUploadModal from './ImageUploadModal';
import ViewReportsModal from './ViewReportsModal';
import NotificationCenter from './NotificationCenter';

export default function ModalProvider() {
  return (
    <>
      <AddTaskModal />
      <InviteMemberModal />
      <AskOctoOpsModal />
      <ImageUploadModal />
      <ViewReportsModal />
      <NotificationCenter />
    </>
  );
}

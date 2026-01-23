'use client';

import React from 'react';
import AddTaskModal from './AddTaskModal';
import InviteMemberModal from './InviteMemberModal';
import AskOctoOpsModal from './AskOctoOpsModal';
import ImageUploadModal from './ImageUploadModal';
import ViewReportsModal from './ViewReportsModal';
import NotificationCenter from './NotificationCenter';
import ProjectVisionModal from './ProjectVisionModal';
import TimelineDetailModal from './TimelineDetailModal';
import AddRiskModal from './AddRiskModal';
import AIRiskAnalysisModal from './AIRiskAnalysisModal';

export default function ModalProvider() {
  return (
    <>
      <AddTaskModal />
      <InviteMemberModal />
      <AskOctoOpsModal />
      <ImageUploadModal />
      <ViewReportsModal />
      <NotificationCenter />
      <ProjectVisionModal />
      <TimelineDetailModal />
      <AddRiskModal />
      <AIRiskAnalysisModal />
    </>
  );
}

'use client';

import React from 'react';
import AddTaskModal from './AddTaskModal';
import InviteMemberModal from './InviteMemberModal';
import AskOctoOpsModal from './AskOctoOpsModal';
import ImageUploadModal from './ImageUploadModal';
import ViewReportsModal from './ViewReportsModal';
import NotificationCenter from './NotificationCenter';
import ProjectVisionModal from './ProjectVisionModal';
import AddRiskModal from './AddRiskModal';
import AIRiskAnalysisModal from './AIRiskAnalysisModal';
import RoadmapModal from './RoadmapModal';
import TimelineDetailModal from './TimelineDetailModal';
import ArchiveConfirmModal from './ArchiveConfirmModal';
import EditTaskModal from './EditTaskModal';
import EditRiskModal from './EditRiskModal';
import CelebrationModal from './CelebrationModal';

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
      <RoadmapModal />
      <ArchiveConfirmModal />
      <EditTaskModal />
      <EditRiskModal />
      <CelebrationModal />
    </>
  );
}

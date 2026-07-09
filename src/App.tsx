import React, { useEffect } from 'react';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import DropZone from './components/DropZone';
import ProgressPanel from './components/ProgressPanel';
import FileQueueTable from './components/FileQueueTable';
import PreviewPanel from './components/PreviewPanel';
import BottomBar from './components/BottomBar';
import Modals from './components/Modals';
import { useFileUpload } from './hooks/useFileUpload';
import { usePreview } from './hooks/usePreview';
import { useSettings, useProcessingControls } from './hooks/useProcessingQueue';
import { log } from './lib/logger';

export default function App() {
  // Register all imperative event hooks
  useFileUpload();
  usePreview();
  useSettings();
  useProcessingControls();

  useEffect(() => {
    log('Aplikasi Auto Crop lokal siap digunakan. Silakan taruh file Anda.');
  }, []);

  return (
    <>
      <AppHeader />
      <div className="main-container">
        <Sidebar />
        <main className="workspace">
          <DropZone />
          <div className="dashboard-body">
            <div className="left-column">
              <ProgressPanel />
              <FileQueueTable />
            </div>
            <PreviewPanel />
          </div>
          <BottomBar />
        </main>
      </div>
      <Modals />
    </>
  );
}

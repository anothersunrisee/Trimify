import React from 'react';

export default function ProgressPanel() {
  return (
    <div className="progress-panel" id="progress-panel" style={{ display: 'none' }}>
      <div className="progress-header">
        <div className="progress-status" id="progress-status">Memproses...</div>
        <div className="progress-stats-row">
          <div className="progress-stats-item">Berjalan: <strong id="progress-time-elapsed">00:00</strong></div>
          <div className="progress-stats-item">Sisa: <strong id="progress-time-remaining">~00:00</strong></div>
        </div>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" id="progress-bar-fill"></div>
      </div>
      <div className="progress-file-info" id="progress-file-info">File saat ini: -</div>
    </div>
  );
}

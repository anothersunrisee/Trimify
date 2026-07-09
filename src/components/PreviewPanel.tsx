import React from 'react';
import { Eye } from 'lucide-react';

export default function PreviewPanel() {
  return (
    <div className="preview-container">
      <div className="panel-header">
        <div className="panel-title">
          <Eye size={13} />
          Preview Crop
        </div>
        <div className="panel-badge" id="preview-filename-badge">Pilih File</div>
      </div>
      <div className="preview-workspace" id="preview-workspace">
        <div className="preview-stage">
          {/* BEFORE */}
          <div className="preview-box">
            <div className="preview-box-title">Sebelum</div>
            <div className="checkerboard-bg">
              <div className="preview-image-wrapper">
                <canvas className="preview-canvas" id="canvas-preview-before"></canvas>
              </div>
            </div>
          </div>
          {/* AFTER */}
          <div className="preview-box">
            <div className="preview-box-title">Sesudah</div>
            <div className="checkerboard-bg">
              <div className="preview-image-wrapper">
                <canvas className="preview-canvas" id="canvas-preview-after"></canvas>
              </div>
            </div>
          </div>
        </div>
        {/* Preview Meta Bar */}
        <div className="preview-meta-row" id="preview-meta-row" style={{ opacity: 0.6 }}>
          <div className="preview-meta-group">
            <span className="preview-meta-label">Dimensi Awal</span>
            <span className="preview-meta-val" id="preview-dim-before">-</span>
          </div>
          <div className="preview-meta-group">
            <span className="preview-meta-label">Dimensi Hasil</span>
            <span className="preview-meta-val" id="preview-dim-after">-</span>
          </div>
          <div className="preview-meta-group">
            <span className="preview-meta-label">Ukuran Berkas</span>
            <span className="preview-meta-val" id="preview-size-change">-</span>
          </div>
          <div className="preview-meta-group" style={{ textAlign: 'right' }}>
            <span className="preview-meta-label">Area Dipangkas</span>
            <span className="preview-meta-val green" id="preview-area-reduced">-</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  FileImage, FolderArchive, SlidersHorizontal, ChevronDown,
  HelpCircle, Settings, PlayCircle, Play, Pause, X, Download, Trash2,
} from 'lucide-react';
import {
  startQueueProcessing,
  pauseQueueProcessing,
  resumeQueueProcessing,
  cancelQueueProcessing,
} from '../hooks/useProcessingQueue';
import { downloadZipArchive } from '../lib/zipExporter';
import { clearFilesQueue } from '../lib/queueActions';
import { useAppStore } from '../store/useAppStore';

function UploadSection() {
  return (
    <div className="sidebar-section">
      <div className="section-title">
        <FileImage size={14} />
        Upload File PNG
      </div>
      <div className="upload-btn-container">
        <button className="btn" onClick={() => document.getElementById('file-input-files')?.click()}>
          <FileImage size={14} />
          Pilih File
        </button>
        <button className="btn" onClick={() => document.getElementById('file-input-folder')?.click()}>
          <FolderArchive size={14} />
          Pilih Folder
        </button>
      </div>
      {/* Hidden file inputs */}
      <input type="file" id="file-input-files" multiple accept="image/png" style={{ display: 'none' }} />
      <input type="file" id="file-input-folder" {...({ webkitdirectory: '', directory: '' } as any)} multiple style={{ display: 'none' }} />
      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '8px', lineHeight: 1.4 }}>
        Mendukung file individual atau seluruh folder sekaligus.
      </div>
    </div>
  );
}

function CropParamsPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sidebar-section">
      <div
        className={`section-title collapsible${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={13} />
          Parameter Crop
        </span>
        <ChevronDown size={13} className="chevron" />
      </div>
      <div className={`accordion-body${open ? ' open' : ''}`}>
        {/* Alpha Threshold */}
        <div className="setting-group">
          <div className="setting-label-row">
            <label className="setting-label tooltip">
              Alpha Threshold
              <HelpCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              <span className="tooltiptext">Batas nilai transparansi pixel (0-255). Pixel dengan nilai alpha &lt; threshold akan dianggap transparan sepenuhnya.</span>
            </label>
            <span className="setting-value" id="val-threshold">1</span>
          </div>
          <input type="range" id="input-threshold" className="slider-input" min="0" max="255" defaultValue="1" />
        </div>
        {/* Ignore Noise */}
        <div className="setting-group">
          <div className="setting-label-row">
            <label className="setting-label tooltip">
              Ignore Small Noise
              <HelpCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              <span className="tooltiptext">Mengabaikan bintik pixel terisolasi berukuran kecil. Nilai pixel menentukan ukuran area pemeriksaan sekitar pixel.</span>
            </label>
            <span className="setting-value" id="val-noise">0 px</span>
          </div>
          <input type="range" id="input-noise" className="slider-input" min="0" max="20" defaultValue="0" />
        </div>
        {/* Padding */}
        <div className="setting-group">
          <div className="setting-label-row">
            <label className="setting-label tooltip">
              Padding Area
              <HelpCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              <span className="tooltiptext">Menambahkan sisa ruang transparan sebesar X pixel di sekeliling objek setelah dipotong.</span>
            </label>
            <span className="setting-value" id="val-padding">0 px</span>
          </div>
          <input type="range" id="input-padding" className="slider-input" min="0" max="100" defaultValue="0" />
        </div>
      </div>
    </div>
  );
}

function OutputSettingsPanel() {
  return (
    <>
      <div className="sidebar-section">
        <div className="section-title">
          <Settings size={14} />
          Pengaturan Output &amp; File
        </div>
        {/* Format Select */}
        <div className="setting-group">
          <div className="setting-label-row">
            <label className="setting-label">Format Output</label>
          </div>
          <select id="input-format" className="select-input" defaultValue="png">
            <option value="png">PNG (Lossless)</option>
            <option value="webp">WebP (Compressed)</option>
            <option value="jpeg">JPEG (Solid Background)</option>
          </select>
        </div>
        {/* Quality Slider */}
        <div className="setting-group" id="container-quality" style={{ display: 'none' }}>
          <div className="setting-label-row">
            <label className="setting-label" id="label-quality">Kualitas Kompresi</label>
            <span className="setting-value" id="val-quality">90%</span>
          </div>
          <input type="range" id="input-quality" className="slider-input" min="10" max="100" defaultValue="90" />
        </div>
        {/* BG Color */}
        <div className="setting-group" id="container-bg-color" style={{ display: 'none' }}>
          <div className="setting-label-row">
            <label className="setting-label">Warna Latar Belakang JPEG</label>
          </div>
          <div className="color-picker-container">
            <input type="color" id="input-bg-color" className="color-input" defaultValue="#ffffff" />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }} id="val-bg-color">#ffffff</span>
          </div>
        </div>
        {/* Toggles */}
        <div className="switch-row">
          <div className="switch-info">
            <span className="setting-label">Pertahankan Struktur Folder</span>
            <span className="switch-desc">Menjaga hirarki folder di dalam ZIP hasil</span>
          </div>
          <label className="switch">
            <input type="checkbox" id="input-preserve-folder" defaultChecked />
            <span className="slider-toggle"></span>
          </label>
        </div>
        <div className="switch-row">
          <div className="switch-info">
            <span className="setting-label">Simpan dengan Nama Sama</span>
            <span className="switch-desc">ON: nama tetap / OFF: diakhiri "_cropped"</span>
          </div>
          <label className="switch">
            <input type="checkbox" id="input-overwrite-filename" />
            <span className="slider-toggle"></span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-section">
        <div className="section-title">
          <PlayCircle size={14} />
          Tindakan Proses
        </div>
        <ActionButtons />
      </div>
    </>
  );
}

function ActionButtons() {
  const { files, status } = useAppStore();
  const processing = status === 'PROCESSING';
  const paused = status === 'PAUSED';
  const idle = status === 'IDLE' || status === 'STOPPED';
  const hasFiles = files.length > 0;
  const hasSuccess = files.some(f => f.status === 'success');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button 
        className="btn btn-primary" 
        id="btn-start" 
        style={{ width: '100%', display: processing ? 'none' : 'block' }} 
        disabled={!hasFiles || !idle} 
        onClick={startQueueProcessing}
      >
        <Play size={14} />
        Mulai Auto Crop
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button 
          className="btn" 
          id="btn-pause" 
          style={{ display: processing ? 'inline-flex' : 'none' }} 
          disabled={!processing} 
          onClick={pauseQueueProcessing}
        >
          <Pause size={14} />
          Pause
        </button>
        <button 
          className="btn btn-secondary" 
          id="btn-resume" 
          style={{ display: paused ? 'inline-flex' : 'none' }} 
          disabled={!paused} 
          onClick={resumeQueueProcessing}
        >
          <Play size={14} />
          Resume
        </button>
        <button 
          className="btn btn-danger" 
          id="btn-cancel" 
          style={{ display: (processing || paused) ? 'inline-flex' : 'none' }} 
          disabled={idle} 
          onClick={cancelQueueProcessing}
        >
          <X size={14} />
          Batal
        </button>
      </div>

      <button 
        className="btn btn-secondary" 
        id="btn-download" 
        style={{ width: '100%' }} 
        disabled={!hasSuccess || processing} 
        onClick={downloadZipArchive}
      >
        <Download size={14} />
        Download Hasil ZIP
      </button>

      <button 
        className="btn btn-danger" 
        id="btn-clear" 
        style={{ width: '100%' }} 
        disabled={processing} 
        onClick={clearFilesQueue}
      >
        <Trash2 size={14} />
        Hapus Semua Antrean
      </button>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <UploadSection />
      <CropParamsPanel />
      <OutputSettingsPanel />
    </aside>
  );
}

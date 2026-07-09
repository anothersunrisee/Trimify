import React from 'react';
import { UploadCloud } from 'lucide-react';

export default function DropZone() {
  return (
    <div
      className="dropzone"
      id="dropzone"
      style={{ flexDirection: 'row', gap: '14px', minHeight: '72px', padding: '14px 24px', alignItems: 'center', textAlign: 'left', flexShrink: 0 }}
    >
      <div className="dropzone-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
        <UploadCloud size={28} />
      </div>
      <div>
        <div className="dropzone-text">Seret &amp; Taruh File atau Folder PNG di Sini</div>
        <div className="dropzone-subtext">100% lokal &mdash; tidak ada upload ke server</div>
      </div>
    </div>
  );
}

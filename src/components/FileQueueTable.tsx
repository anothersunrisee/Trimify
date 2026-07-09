import React from 'react';
import { List, Image } from 'lucide-react';

export default function FileQueueTable() {
  return (
    <div className="file-list-container">
      <div className="panel-header">
        <div className="panel-title">
          <List size={13} />
          Daftar Antrean
        </div>
        <div className="panel-badge" id="badge-total-files">0 File</div>
      </div>
      <div className="file-table-wrapper">
        <table id="file-table">
          <thead>
            <tr>
              <th>Nama File</th>
              <th style={{ width: '68px' }}>Status</th>
              <th style={{ width: '80px' }}>Resolusi</th>
              <th style={{ width: '72px' }}>Ukuran</th>
              <th style={{ width: '52px' }}>-</th>
            </tr>
          </thead>
          <tbody id="file-table-body">
            {/* populated by useProcessingQueue.updateFileListUI() */}
          </tbody>
        </table>
        <div className="empty-state" id="table-empty-state">
          <div className="empty-state-icon">
            <Image size={36} />
          </div>
          <p>Antrean kosong. Taruh gambar atau gunakan panel samping untuk mulai.</p>
        </div>
      </div>
    </div>
  );
}

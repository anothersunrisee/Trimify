import React, { useEffect } from 'react';
import { List, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { updateFileListUI } from '../hooks/useProcessingQueue';

export default function FileQueueTable() {
  const { currentPage } = useAppStore();

  useEffect(() => {
    updateFileListUI();
  }, [currentPage]);

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
      <PaginationFooter />
    </div>
  );
}

function PaginationFooter() {
  const { files, currentPage, itemsPerPage, setCurrentPage } = useAppStore();
  const total = files.length;
  
  if (total === 0) return null;

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="pagination-controls" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      borderTop: '1px solid var(--color-border-subtle)',
      fontSize: '12px',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text-secondary)'
    }}>
      <div>
        Menampilkan <strong style={{color: 'var(--color-text-primary)'}}>{startIdx} - {endIdx}</strong> dari <strong style={{color: 'var(--color-text-primary)'}}>{total}</strong> file
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button 
          className="btn" 
          style={{ padding: '2px 6px' }}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ margin: '0 4px', fontVariantNumeric: 'tabular-nums' }}>
          {currentPage} / {totalPages}
        </span>
        <button 
          className="btn" 
          style={{ padding: '2px 6px' }}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

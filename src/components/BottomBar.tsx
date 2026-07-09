import React from 'react';
import { Terminal, ExternalLink, Coffee } from 'lucide-react';
import { useDialogStore } from '../store/useDialogStore';
import { copyConsoleLogs, clearConsoleLogs } from '../lib/logger';

export default function BottomBar() {
  const { showAlertDialog, openDonationModal } = useDialogStore();

  return (
    <div className="bottom-bar">
      {/* Console Log */}
      <div className="console-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Terminal size={12} />
            Log Aktivitas
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              id="btn-copy-log"
              onClick={() => copyConsoleLogs(showAlertDialog)}
            >
              Copy
            </button>
            <button
              className="btn"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              id="btn-clear-log"
              onClick={clearConsoleLogs}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="console-output" id="console-output">
          {/* Logging lines populated by log() */}
        </div>
      </div>

      {/* About Card */}
      <div className="about-card">
        <div>
          <div className="about-card-name">Trimify</div>
          <div className="about-card-desc">Bulk auto-crop transparent PNG — 100% local processing, zero upload.</div>
        </div>
        <div className="about-card-actions">
          <a
            href="https://fajarahnf.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="about-card-link"
            style={{ marginTop: 0 }}
          >
            <ExternalLink size={10} />
            fajarahnf.vercel.app
          </a>
          <button
            type="button"
            className="about-card-btn"
            style={{ marginTop: 0 }}
            onClick={openDonationModal}
            title="Traktir Kopi / Support Developer"
          >
            <Coffee size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

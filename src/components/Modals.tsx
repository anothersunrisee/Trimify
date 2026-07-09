import React, { useEffect, useRef } from 'react';
import { X, Coffee, Info, AlertTriangle, AlertCircle, CheckCircle2, FileCheck } from 'lucide-react';
import { useDialogStore } from '../store/useDialogStore';

// ─── Toast Notification ───
export function ToastNotification() {
  const { toast, hideToast } = useDialogStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast.show) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => hideToast(), 4000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.show, toast.title]);

  const iconMap: Record<string, React.ReactNode> = {
    'check-circle-2': <CheckCircle2 size={24} />,
    'file-check': <FileCheck size={24} />,
    'info': <Info size={24} />,
    'alert-triangle': <AlertTriangle size={24} />,
    'alert-circle': <AlertCircle size={24} />,
  };

  return (
    <div className={`toast${toast.show ? ' show' : ''}`} id="success-toast">
      <div className="toast-icon">
        {iconMap[toast.icon] ?? <CheckCircle2 size={24} />}
      </div>
      <div>
        <div className="toast-title" id="toast-title">{toast.title || 'Kompresi Selesai!'}</div>
        <div className="toast-desc" id="toast-message">{toast.desc || 'Seluruh antrean PNG berhasil dipangkas sempurna.'}</div>
      </div>
    </div>
  );
}

// ─── Donation Modal ───
export function DonationModal() {
  const { donationModal, closeDonationModal } = useDialogStore();
  return (
    <div
      className={`modal-backdrop${donationModal.show ? ' show' : ''}`}
      id="donation-modal"
      onClick={(e) => { if (e.target === e.currentTarget) closeDonationModal(); }}
    >
      <div className="modal-card">
        <button type="button" className="modal-close-btn" onClick={closeDonationModal} aria-label="Tutup modal">
          <X size={16} />
        </button>
        <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <Coffee size={20} color="var(--color-text-primary)" />
        </div>
        <div className="modal-title">Traktir Kopi Developer</div>
        <div className="modal-desc">Scan QRIS di bawah untuk mendukung pengembangan Trimify agar terus gratis &amp; 100% lokal.</div>
        <div className="qris-container">
          <img src="/QRIS.png" alt="QRIS Donation Code" className="qris-image" />
        </div>
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={closeDonationModal}>
          Tutup
        </button>
      </div>
    </div>
  );
}

// ─── App Alert Dialog ───
export function AppDialog() {
  const { alertDialog, hideAlertDialog } = useDialogStore();

  const iconMap: Record<string, React.ReactNode> = {
    info: <Info size={20} color="var(--color-text-primary)" />,
    warning: <AlertTriangle size={20} color="var(--color-warning)" />,
    error: <AlertCircle size={20} color="var(--color-error)" />,
    success: <CheckCircle2 size={20} color="var(--color-success)" />,
  };

  return (
    <div
      className={`modal-backdrop${alertDialog.show ? ' show' : ''}`}
      id="app-dialog-modal"
      onClick={(e) => { if (e.target === e.currentTarget) hideAlertDialog(); }}
    >
      <div className="modal-card" style={{ maxWidth: 360 }}>
        <button type="button" className="modal-close-btn" onClick={hideAlertDialog} aria-label="Tutup modal">
          <X size={16} />
        </button>
        <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          {iconMap[alertDialog.type] ?? iconMap.info}
        </div>
        <div className="modal-title" id="app-dialog-title">{alertDialog.title || 'Informasi'}</div>
        <div className="modal-desc" id="app-dialog-desc">{alertDialog.desc}</div>
        <button type="button" className="btn" style={{ width: '100%', marginTop: 16 }} onClick={hideAlertDialog}>
          Mengerti
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───
export function ConfirmDialog() {
  const { confirmDialog, hideConfirmDialog } = useDialogStore();

  const handleConfirm = () => {
    const cb = confirmDialog.onConfirm;
    hideConfirmDialog();
    if (cb) cb();
  };

  return (
    <div
      className={`modal-backdrop${confirmDialog.show ? ' show' : ''}`}
      id="confirm-dialog-modal"
      onClick={(e) => { if (e.target === e.currentTarget) hideConfirmDialog(); }}
    >
      <div className="modal-card" style={{ maxWidth: 360 }}>
        <button type="button" className="modal-close-btn" onClick={hideConfirmDialog} aria-label="Tutup modal">
          <X size={16} />
        </button>
        <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'var(--color-error-bg)', border: '1px solid rgba(153,27,27,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <AlertTriangle size={20} color="var(--color-error)" />
        </div>
        <div className="modal-title" id="confirm-dialog-title">{confirmDialog.title}</div>
        <div className="modal-desc" id="confirm-dialog-desc">{confirmDialog.desc}</div>
        <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 16 }}>
          <button type="button" className="btn" style={{ flex: 1 }} onClick={hideConfirmDialog}>
            Batal
          </button>
          <button
            type="button"
            className={`btn ${confirmDialog.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            style={{ flex: 1 }}
            id="confirm-dialog-btn"
            onClick={handleConfirm}
          >
            {confirmDialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── All Modals Combined ───
export default function Modals() {
  const { hideAlertDialog, hideConfirmDialog, closeDonationModal } = useDialogStore();

  // Global Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDonationModal();
        hideAlertDialog();
        hideConfirmDialog();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <ToastNotification />
      <DonationModal />
      <AppDialog />
      <ConfirmDialog />
    </>
  );
}

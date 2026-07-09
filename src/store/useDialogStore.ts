import { create } from 'zustand';

export type DialogType = 'info' | 'warning' | 'error' | 'success';

interface ToastState {
  show: boolean;
  title: string;
  desc: string;
  icon: string;
}

interface AlertDialogState {
  show: boolean;
  title: string;
  desc: string;
  type: DialogType;
}

interface ConfirmDialogState {
  show: boolean;
  title: string;
  desc: string;
  confirmText: string;
  variant: 'danger' | 'primary';
  onConfirm: (() => void) | null;
}

interface DialogStore {
  toast: ToastState;
  alertDialog: AlertDialogState;
  confirmDialog: ConfirmDialogState;
  donationModal: { show: boolean };

  showToast: (title: string, desc: string, icon?: string) => void;
  hideToast: () => void;
  showAlertDialog: (title: string, desc: string, type?: DialogType) => void;
  hideAlertDialog: () => void;
  showConfirmDialog: (opts: {
    title: string;
    desc: string;
    confirmText?: string;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
  }) => void;
  hideConfirmDialog: () => void;
  openDonationModal: () => void;
  closeDonationModal: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  toast: { show: false, title: '', desc: '', icon: 'check-circle-2' },
  alertDialog: { show: false, title: '', desc: '', type: 'info' },
  confirmDialog: {
    show: false,
    title: '',
    desc: '',
    confirmText: 'Ya, Lanjutkan',
    variant: 'danger',
    onConfirm: null,
  },
  donationModal: { show: false },

  showToast: (title, desc, icon = 'check-circle-2') =>
    set({ toast: { show: true, title, desc, icon } }),
  hideToast: () =>
    set((s) => ({ toast: { ...s.toast, show: false } })),

  showAlertDialog: (title, desc, type = 'info') =>
    set({ alertDialog: { show: true, title, desc, type } }),
  hideAlertDialog: () =>
    set((s) => ({ alertDialog: { ...s.alertDialog, show: false } })),

  showConfirmDialog: ({ title, desc, confirmText = 'Ya, Lanjutkan', variant = 'danger', onConfirm }) =>
    set({ confirmDialog: { show: true, title, desc, confirmText, variant, onConfirm } }),
  hideConfirmDialog: () =>
    set((s) => ({ confirmDialog: { ...s.confirmDialog, show: false, onConfirm: null } })),

  openDonationModal: () => set({ donationModal: { show: true } }),
  closeDonationModal: () => set({ donationModal: { show: false } }),
}));

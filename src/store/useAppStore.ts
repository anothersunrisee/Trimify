import { create } from 'zustand';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  relativePath: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  originalSize: number;
  croppedSize: number | null;
  originalWidth: number | null;
  originalHeight: number | null;
  croppedWidth: number | null;
  croppedHeight: number | null;
  croppedBlob: Blob | null;
  croppedUrl: string | null;
  error: string | null;
  bounds?: { x: number; y: number; w: number; h: number };
}

export type AppStatus = 'IDLE' | 'PROCESSING' | 'PAUSED' | 'STOPPED';

interface AppState {
  status: AppStatus;
  files: FileItem[];
  currentIndex: number;
  startTime: number | null;
  elapsedInterval: ReturnType<typeof setInterval> | null;
  elapsedSeconds: number;
  selectedPreviewId: string | null;
  totalSavingsSize: number;
  totalOriginalSize: number;
  totalCroppedSize: number;
  zipBlob: Blob | null;
  pauseResolver: (() => void) | null;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Actions
  setStatus: (status: AppStatus) => void;
  setFiles: (files: FileItem[]) => void;
  addFiles: (files: FileItem[]) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setCurrentIndex: (idx: number) => void;
  setStartTime: (t: number | null) => void;
  setElapsedInterval: (interval: ReturnType<typeof setInterval> | null) => void;
  setElapsedSeconds: (s: number) => void;
  incrementElapsedSeconds: () => void;
  setSelectedPreviewId: (id: string | null) => void;
  setTotalStats: (orig: number, cropped: number) => void;
  setZipBlob: (blob: Blob | null) => void;
  setPauseResolver: (fn: (() => void) | null) => void;
  setCurrentPage: (page: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: 'IDLE',
  files: [],
  currentIndex: 0,
  startTime: null,
  elapsedInterval: null,
  elapsedSeconds: 0,
  selectedPreviewId: null,
  totalSavingsSize: 0,
  totalOriginalSize: 0,
  totalCroppedSize: 0,
  zipBlob: null,
  pauseResolver: null,
  currentPage: 1,
  itemsPerPage: 50,

  setStatus: (status) => set({ status }),
  setFiles: (files) => set({ files }),
  addFiles: (newFiles) =>
    set((state) => ({ files: [...state.files, ...newFiles] })),
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  clearFiles: () =>
    set({
      files: [],
      currentIndex: 0,
      status: 'IDLE',
      zipBlob: null,
      totalOriginalSize: 0,
      totalCroppedSize: 0,
      totalSavingsSize: 0,
      selectedPreviewId: null,
    }),
  setCurrentIndex: (idx) => set({ currentIndex: idx }),
  setStartTime: (t) => set({ startTime: t }),
  setElapsedInterval: (interval) => set({ elapsedInterval: interval }),
  setElapsedSeconds: (s) => set({ elapsedSeconds: s }),
  incrementElapsedSeconds: () =>
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  setSelectedPreviewId: (id) => set({ selectedPreviewId: id }),
  setTotalStats: (orig, cropped) =>
    set({ totalOriginalSize: orig, totalCroppedSize: cropped, totalSavingsSize: orig - cropped }),
  setZipBlob: (blob) => set({ zipBlob: blob }),
  setPauseResolver: (fn) => set({ pauseResolver: fn }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
